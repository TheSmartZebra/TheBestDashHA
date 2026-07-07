"use client";

import { useEntitiesStore } from "../../store/entities-store";
import type { ClientMessage, ServerMessage } from "./types";

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };

class HaClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, Pending>();
  private subscriptions = new Map<string, (msg: ServerMessage) => void>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUs = false;

  connect() {
    if (this.ws) return;
    this.closedByUs = false;
    this.open();
  }

  private open() {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.reconnectAttempt = 0;
    });

    ws.addEventListener("message", (ev) => {
      this.handleMessage(JSON.parse(ev.data as string));
    });

    ws.addEventListener("close", () => {
      this.ws = null;
      useEntitiesStore.getState().setStatus("disconnected");
      if (!this.closedByUs) this.scheduleReconnect();
    });

    ws.addEventListener("error", () => {
      ws.close();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 15000);
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  disconnect() {
    this.closedByUs = true;
    this.ws?.close();
  }

  private handleMessage(msg: ServerMessage) {
    const store = useEntitiesStore.getState();
    switch (msg.type) {
      case "connection_status":
        store.setStatus(msg.status);
        break;
      case "state_snapshot":
        store.setStatus("connected");
        store.setStates(msg.states);
        break;
      case "registry_snapshot":
        store.setRegistries(msg.registries);
        break;
      case "ha_event":
      case "template_result": {
        const subId = msg.subId;
        this.subscriptions.get(subId)?.(msg);
        break;
      }
      case "service_result":
      case "user_data_result":
      case "assist_reply":
      case "ha_command_result":
      case "subscribed":
      case "unsubscribed": {
        const p = this.pending.get(msg.requestId);
        if (!p) return;
        this.pending.delete(msg.requestId);
        if ((msg.type === "service_result" || msg.type === "ha_command_result") && !msg.ok) {
          p.reject(new Error(msg.error));
        } else {
          p.resolve(msg);
        }
        break;
      }
    }
  }

  private send<T>(msg: ClientMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected to Home Assistant relay"));
        return;
      }
      this.pending.set((msg as any).requestId, { resolve, reject });
      this.ws.send(JSON.stringify(msg));
    });
  }

  callService(
    domain: string,
    service: string,
    target?: { entity_id?: string | string[]; area_id?: string | string[]; device_id?: string | string[] },
    data?: Record<string, unknown>
  ): Promise<void> {
    const requestId = crypto.randomUUID();
    return this.send({ type: "call_service", requestId, domain, service, target, data }).then(() => undefined);
  }

  getUserData<T>(key: string): Promise<T> {
    const requestId = crypto.randomUUID();
    return this.send<{ value: T }>({ type: "get_user_data", requestId, key }).then((r) => r.value);
  }

  setUserData(key: string, value: unknown): Promise<void> {
    const requestId = crypto.randomUUID();
    return this.send({ type: "set_user_data", requestId, key, value }).then(() => undefined);
  }

  assistText(text: string, conversationId: string | null): Promise<{ text: string; conversationId: string | null }> {
    const requestId = crypto.randomUUID();
    return this.send({ type: "assist_text", requestId, text, conversationId });
  }

  /** Generic one-shot passthrough to any HA WS command (registries, config entries, backups, etc). */
  command<T>(command: Record<string, unknown>): Promise<T> {
    const requestId = crypto.randomUUID();
    return this.send<{ result: T }>({ type: "ha_command", requestId, command }).then((r) => r.result);
  }

  /** Subscribes to HA events (optionally filtered by type). Returns an unsubscribe function. */
  async subscribeEvents(eventType: string | undefined, onEvent: (event: unknown) => void): Promise<() => void> {
    const requestId = crypto.randomUUID();
    const res = await this.send<{ subId: string }>({ type: "subscribe_events", requestId, eventType });
    this.subscriptions.set(res.subId, (msg) => {
      if (msg.type === "ha_event") onEvent(msg.event);
    });
    return () => this.unsubscribe(res.subId);
  }

  /** Subscribes to a live-rendering Jinja2 template. Returns an unsubscribe function. */
  async subscribeTemplate(
    template: string,
    onResult: (result: { result: string; error?: string }) => void
  ): Promise<() => void> {
    const requestId = crypto.randomUUID();
    const res = await this.send<{ subId: string }>({ type: "subscribe_template", requestId, template });
    this.subscriptions.set(res.subId, (msg) => {
      if (msg.type === "template_result") onResult({ result: msg.result, error: msg.error });
    });
    return () => this.unsubscribe(res.subId);
  }

  private unsubscribe(subId: string) {
    this.subscriptions.delete(subId);
    const requestId = crypto.randomUUID();
    void this.send({ type: "unsubscribe", requestId, subId }).catch(() => {});
  }
}

let singleton: HaClient | null = null;

export function getHaClient(): HaClient {
  if (!singleton) singleton = new HaClient();
  return singleton;
}
