import type { Server as HttpServer, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { haHub } from "./ha-connection";
import { getSessionFromCookieHeader } from "./session";
import type { ClientMessage, ServerMessage } from "../lib/ha/types";

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export function attachRelay(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const { pathname } = new URL(req.url ?? "", "http://localhost");
    if (pathname !== "/api/ws") return;

    getSessionFromCookieHeader(req.headers.cookie)
      .then((session) => {
        if (!session.loggedIn) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      })
      .catch(() => {
        socket.destroy();
      });
  });

  wss.on("connection", (ws: WebSocket) => {
    send(ws, { type: "connection_status", status: haHub.status });
    send(ws, { type: "state_snapshot", states: haHub.getStates() });
    send(ws, { type: "registry_snapshot", registries: haHub.getRegistries() });

    const onStatus = (status: typeof haHub.status) => send(ws, { type: "connection_status", status });
    const onStates = (states: ReturnType<typeof haHub.getStates>) => send(ws, { type: "state_snapshot", states });
    const onRegistries = (registries: ReturnType<typeof haHub.getRegistries>) =>
      send(ws, { type: "registry_snapshot", registries });

    haHub.on("status", onStatus);
    haHub.on("state_snapshot", onStates);
    haHub.on("registry_snapshot", onRegistries);

    /** Live subscriptions (events / reactive templates) opened by this connection. */
    const subs = new Map<string, () => void>();

    ws.on("message", (raw) => {
      void handleClientMessage(ws, raw.toString(), subs);
    });

    ws.on("close", () => {
      haHub.off("status", onStatus);
      haHub.off("state_snapshot", onStates);
      haHub.off("registry_snapshot", onRegistries);
      for (const unsub of subs.values()) unsub();
      subs.clear();
    });
  });

  return wss;
}

async function handleClientMessage(ws: WebSocket, raw: string, subs: Map<string, () => void>) {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  try {
    switch (msg.type) {
      case "call_service": {
        await haHub.callService(msg.domain, msg.service, msg.target, msg.data);
        send(ws, { type: "service_result", requestId: msg.requestId, ok: true });
        break;
      }
      case "get_user_data": {
        const value = await haHub.getUserData(msg.key);
        send(ws, { type: "user_data_result", requestId: msg.requestId, key: msg.key, value });
        break;
      }
      case "set_user_data": {
        await haHub.setUserData(msg.key, msg.value);
        send(ws, { type: "user_data_result", requestId: msg.requestId, key: msg.key, value: msg.value });
        break;
      }
      case "assist_text": {
        const reply = await haHub.converse(msg.text, msg.conversationId);
        send(ws, {
          type: "assist_reply",
          requestId: msg.requestId,
          text: reply.text,
          conversationId: reply.conversationId
        });
        break;
      }
      case "ha_command": {
        const result = await haHub.command(msg.command);
        send(ws, { type: "ha_command_result", requestId: msg.requestId, ok: true, result });
        break;
      }
      case "subscribe_events": {
        const subId = randomUUID();
        const unsub = await haHub.subscribeEvents(msg.eventType, (event) => {
          send(ws, { type: "ha_event", subId, event });
        });
        subs.set(subId, unsub);
        send(ws, { type: "subscribed", requestId: msg.requestId, subId });
        break;
      }
      case "subscribe_template": {
        const subId = randomUUID();
        const unsub = await haHub.subscribeTemplate(msg.template, (result) => {
          send(ws, {
            type: "template_result",
            subId,
            result: result.result ?? "",
            error: result.error
          });
        });
        subs.set(subId, unsub);
        send(ws, { type: "subscribed", requestId: msg.requestId, subId });
        break;
      }
      case "unsubscribe": {
        subs.get(msg.subId)?.();
        subs.delete(msg.subId);
        send(ws, { type: "unsubscribed", requestId: msg.requestId });
        break;
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    if ("requestId" in msg) {
      if (msg.type === "call_service") {
        send(ws, { type: "service_result", requestId: msg.requestId, ok: false, error });
      } else {
        send(ws, { type: "ha_command_result", requestId: msg.requestId, ok: false, error });
      }
    }
    console.error("[relay] error handling client message", msg.type, err);
  }
}
