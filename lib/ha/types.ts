import type { HassEntities, HassEntity, HassServices } from "home-assistant-js-websocket";

export type { HassEntities, HassEntity, HassServices };

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  picture: string | null;
  icon: string | null;
  floor_id: string | null;
}

export interface DeviceRegistryEntry {
  id: string;
  area_id: string | null;
  name: string | null;
  name_by_user: string | null;
  manufacturer: string | null;
  model: string | null;
  disabled_by: string | null;
  config_entries: string[];
}

export interface EntityRegistryEntry {
  entity_id: string;
  area_id: string | null;
  device_id: string | null;
  config_entry_id?: string | null;
  name: string | null;
  icon: string | null;
  platform: string;
  hidden_by: string | null;
  disabled_by: string | null;
  entity_category?: "config" | "diagnostic" | null;
  labels?: string[];
}

export interface ConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  source: string;
  state: string;
  disabled_by: string | null;
  supports_options: boolean;
  supports_remove: boolean;
  supports_unload: boolean;
  reason?: string | null;
}

export interface RegistrySnapshot {
  areas: AreaRegistryEntry[];
  devices: DeviceRegistryEntry[];
  entities: EntityRegistryEntry[];
}

/** Messages the relay server sends down to a browser client. */
export type ServerMessage =
  | { type: "connection_status"; status: "connecting" | "connected" | "disconnected" }
  | { type: "state_snapshot"; states: HassEntities }
  | { type: "state_changed"; entityId: string; state: HassEntity }
  | { type: "state_removed"; entityId: string }
  | { type: "registry_snapshot"; registries: RegistrySnapshot }
  | { type: "service_result"; requestId: string; ok: true }
  | { type: "service_result"; requestId: string; ok: false; error: string }
  | { type: "user_data_result"; requestId: string; key: string; value: unknown }
  | { type: "assist_reply"; requestId: string; text: string; conversationId: string | null }
  | { type: "ha_command_result"; requestId: string; ok: true; result: unknown }
  | { type: "ha_command_result"; requestId: string; ok: false; error: string }
  | { type: "subscribed"; requestId: string; subId: string }
  | { type: "unsubscribed"; requestId: string }
  | { type: "ha_event"; subId: string; event: unknown }
  | { type: "template_result"; subId: string; result: string; error?: string };

/** Messages a browser client sends up to the relay server. */
export type ClientMessage =
  | {
      type: "call_service";
      requestId: string;
      domain: string;
      service: string;
      target?: { entity_id?: string | string[]; area_id?: string | string[]; device_id?: string | string[] };
      data?: Record<string, unknown>;
    }
  | { type: "get_user_data"; requestId: string; key: string }
  | { type: "set_user_data"; requestId: string; key: string; value: unknown }
  | { type: "assist_text"; requestId: string; text: string; conversationId: string | null }
  /**
   * Generic one-shot passthrough to connection.sendMessagePromise(command).
   * The whole app already sits behind its own login as a superuser gateway
   * to the house (call_service above is already an unrestricted passthrough
   * in the same sense), so this extends that same trust boundary to cover
   * read/config WS commands (registries, config entries, backups, etc.)
   * instead of hand-rolling a bespoke relay message per admin feature.
   */
  | { type: "ha_command"; requestId: string; command: Record<string, unknown> }
  | { type: "subscribe_events"; requestId: string; eventType?: string }
  | { type: "subscribe_template"; requestId: string; template: string }
  | { type: "unsubscribe"; requestId: string; subId: string };

export const APP_USER_DATA_KEY = "liquid_glass_dashboard";

export type ThemeMode = "system" | "light" | "dark";
export type Tint = "Graphite" | "Indigo" | "Mocha" | "Granite";

export interface AppUserData {
  v: 2;
  pinned: string[];
  accent: string;
  tint: Tint;
  showScenes: boolean;
  /** Manual light/dark override, or "system" to follow the OS/browser preference. */
  themeMode: ThemeMode;
  /** Whether the first-run entity setup wizard has been completed. */
  onboarded: boolean;
  /** Entity IDs explicitly excluded from the dashboard by the user. */
  hiddenEntities: string[];
}

export const DEFAULT_APP_USER_DATA: AppUserData = {
  v: 2,
  pinned: [],
  accent: "#F5A623",
  tint: "Granite",
  showScenes: true,
  themeMode: "system",
  onboarded: false,
  hiddenEntities: []
};
