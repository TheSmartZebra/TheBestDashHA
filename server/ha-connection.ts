import { EventEmitter } from "node:events";
import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  type Connection,
  type HassEntities
} from "home-assistant-js-websocket";
import { env } from "../lib/env";
import type { AreaRegistryEntry, DeviceRegistryEntry, EntityRegistryEntry, RegistrySnapshot } from "../lib/ha/types";

/**
 * A single, process-wide connection to Home Assistant, shared by every
 * browser tab through the relay server. This is the only place the HA
 * long-lived token is ever read.
 */
class HaHub extends EventEmitter {
  private connection: Connection | null = null;
  private connecting: Promise<Connection> | null = null;
  private states: HassEntities = {};
  private registries: RegistrySnapshot = { areas: [], devices: [], entities: [] };

  status: "connecting" | "connected" | "disconnected" = "connecting";

  async getConnection(): Promise<Connection> {
    if (this.connection) return this.connection;
    if (this.connecting) return this.connecting;

    this.connecting = this.connect();
    this.connection = await this.connecting;
    this.connecting = null;
    return this.connection;
  }

  private async connect(): Promise<Connection> {
    const auth = createLongLivedTokenAuth(env.haUrl, env.haToken);
    const connection = await createConnection({ auth });

    connection.addEventListener("ready", () => this.setStatus("connected"));
    connection.addEventListener("disconnected", () => this.setStatus("disconnected"));
    connection.addEventListener("reconnect-error", () => this.setStatus("disconnected"));

    subscribeEntities(connection, (entities) => {
      this.states = entities;
      this.emit("state_snapshot", entities);
    });

    await this.loadRegistries(connection);
    this.subscribeRegistryUpdates(connection);

    this.setStatus("connected");
    return connection;
  }

  private setStatus(status: HaHub["status"]) {
    this.status = status;
    this.emit("status", status);
  }

  private async loadRegistries(connection: Connection) {
    const [areas, devices, entities] = await Promise.all([
      connection.sendMessagePromise<AreaRegistryEntry[]>({ type: "config/area_registry/list" }),
      connection.sendMessagePromise<DeviceRegistryEntry[]>({ type: "config/device_registry/list" }),
      connection.sendMessagePromise<EntityRegistryEntry[]>({ type: "config/entity_registry/list" })
    ]);
    this.registries = { areas, devices, entities };
    this.emit("registry_snapshot", this.registries);
  }

  private subscribeRegistryUpdates(connection: Connection) {
    const refetch = () => {
      this.loadRegistries(connection).catch((err) => {
        console.error("[ha-connection] failed to refresh registries", err);
      });
    };
    connection.subscribeEvents(refetch, "area_registry_updated");
    connection.subscribeEvents(refetch, "device_registry_updated");
    connection.subscribeEvents(refetch, "entity_registry_updated");
  }

  getStates(): HassEntities {
    return this.states;
  }

  getRegistries(): RegistrySnapshot {
    return this.registries;
  }

  async callService(
    domain: string,
    service: string,
    target: Record<string, unknown> | undefined,
    data: Record<string, unknown> | undefined
  ) {
    const connection = await this.getConnection();
    return connection.sendMessagePromise({
      type: "call_service",
      domain,
      service,
      target,
      service_data: data
    });
  }

  async getUserData(key: string): Promise<unknown> {
    const connection = await this.getConnection();
    const res = await connection.sendMessagePromise<{ value: unknown }>({
      type: "frontend/get_user_data",
      key
    });
    return res.value;
  }

  async converse(text: string, conversationId: string | null): Promise<{ text: string; conversationId: string | null }> {
    const connection = await this.getConnection();
    const res = await connection.sendMessagePromise<{
      response: { speech?: { plain?: { speech?: string } }; response_type: string };
      conversation_id: string | null;
    }>({
      type: "conversation/process",
      text,
      conversation_id: conversationId
    });
    return {
      text: res.response?.speech?.plain?.speech ?? "(no response)",
      conversationId: res.conversation_id
    };
  }

  async setUserData(key: string, value: unknown): Promise<void> {
    const connection = await this.getConnection();
    await connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key,
      value
    });
  }

  /** Generic one-shot passthrough for any request/response WS command. */
  async command<T>(command: Record<string, unknown>): Promise<T> {
    const connection = await this.getConnection();
    return connection.sendMessagePromise<T>(command as never);
  }

  async subscribeEvents(eventType: string | undefined, callback: (ev: unknown) => void): Promise<() => void> {
    const connection = await this.getConnection();
    const unsub = await connection.subscribeEvents(callback, eventType);
    return () => void unsub();
  }

  async subscribeTemplate(
    template: string,
    callback: (result: { result?: string; error?: string }) => void
  ): Promise<() => void> {
    const connection = await this.getConnection();
    const unsub = await connection.subscribeMessage<{ result?: string; error?: string }>(callback, {
      type: "render_template",
      template
    });
    return () => void unsub();
  }
}

export const haHub = new HaHub();
