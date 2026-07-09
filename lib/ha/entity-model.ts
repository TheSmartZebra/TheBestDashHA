import type { HassEntity, RegistrySnapshot } from "./types";

export type Kind =
  | "light"
  | "climate"
  | "lock"
  | "cover"
  | "fan"
  | "media_player"
  | "camera"
  | "switch"
  | "outlet"
  | "sensor"
  | "binary_sensor"
  | "humidifier"
  | "vacuum"
  | "alarm_control_panel"
  | "automation"
  | "scene"
  | "script"
  | "person"
  | "zone"
  | "generic";

export type Category = "climate" | "lights" | "security" | "cameras" | "media" | null;

export function domainOf(entityId: string): string {
  return entityId.split(".", 1)[0] ?? "";
}

export function kindOf(entity: HassEntity): Kind {
  const domain = domainOf(entity.entity_id);
  const deviceClass = entity.attributes.device_class as string | undefined;

  switch (domain) {
    case "light":
      return "light";
    case "climate":
      return "climate";
    case "lock":
      return "lock";
    case "cover":
      return "cover";
    case "fan":
      return "fan";
    case "media_player":
      return "media_player";
    case "camera":
      return "camera";
    case "switch":
      return deviceClass === "outlet" ? "outlet" : "switch";
    case "humidifier":
      return "humidifier";
    case "vacuum":
      return "vacuum";
    case "alarm_control_panel":
      return "alarm_control_panel";
    case "automation":
      return "automation";
    case "scene":
      return "scene";
    case "script":
      return "script";
    case "person":
      return "person";
    case "zone":
      return "zone";
    case "binary_sensor":
      return "binary_sensor";
    case "sensor":
      return "sensor";
    default:
      return "generic";
  }
}

/** Kind -> sidebar/stat-card category. Mirrors the prototype's catOf(). */
export function categoryOfKind(kind: Kind): Category {
  if (kind === "light") return "lights";
  if (kind === "climate" || kind === "fan" || kind === "humidifier") return "climate";
  if (kind === "lock" || kind === "alarm_control_panel") return "security";
  if (kind === "camera") return "cameras";
  if (kind === "media_player") return "media";
  return null;
}

export const CATEGORY_LABEL: Record<NonNullable<Category>, string> = {
  climate: "Climate",
  lights: "Lights",
  security: "Security",
  cameras: "Cameras",
  media: "Speakers & TVs"
};

/** Domains that show up as controllable dashboard tiles (vs. registry-only/diagnostic entities). */
const TILE_DOMAINS = new Set([
  "light",
  "climate",
  "lock",
  "cover",
  "fan",
  "media_player",
  "camera",
  "switch",
  "humidifier",
  "vacuum",
  "alarm_control_panel",
  "sensor",
  "binary_sensor"
]);

export function isTileEntity(entityId: string): boolean {
  return TILE_DOMAINS.has(domainOf(entityId));
}

export function effectiveAreaId(
  entityId: string,
  registries: RegistrySnapshot
): string | null {
  const reg = registries.entities.find((e) => e.entity_id === entityId);
  if (reg?.area_id) return reg.area_id;
  if (reg?.device_id) {
    const device = registries.devices.find((d) => d.id === reg.device_id);
    if (device?.area_id) return device.area_id;
  }
  return null;
}

export function areaName(areaId: string | null, registries: RegistrySnapshot): string {
  if (!areaId) return "Other";
  return registries.areas.find((a) => a.area_id === areaId)?.name ?? "Other";
}

export function isHidden(entityId: string, registries: RegistrySnapshot): boolean {
  const reg = registries.entities.find((e) => e.entity_id === entityId);
  return !!(reg?.hidden_by || reg?.disabled_by);
}

/** Which gesture affordances a tile of this kind supports (dispatch key for components/tiles). */
export type GestureKind =
  | "toggle"
  | "drag-brightness"
  | "drag-position"
  | "thermostat"
  | "hold-unlock"
  | "cycle-fan-speed"
  | "media-drag-volume"
  | "readonly";

export function gestureKindFor(kind: Kind): GestureKind {
  switch (kind) {
    case "light":
      return "drag-brightness";
    case "cover":
      return "drag-position";
    case "climate":
      return "thermostat";
    case "lock":
      return "hold-unlock";
    case "fan":
      return "cycle-fan-speed";
    case "media_player":
      return "media-drag-volume";
    case "sensor":
    case "binary_sensor":
      return "readonly";
    default:
      return "toggle";
  }
}

export function kindColorVar(kind: Kind): string {
  const map: Partial<Record<Kind, string>> = {
    light: "var(--kind-light)",
    climate: "var(--kind-climate)",
    lock: "var(--kind-lock)",
    camera: "var(--kind-camera)",
    media_player: "var(--kind-media)",
    outlet: "var(--kind-outlet)",
    switch: "var(--kind-switch)",
    fan: "var(--kind-fan)",
    cover: "var(--kind-cover)",
    sensor: "var(--kind-sensor)",
    binary_sensor: "var(--kind-sensor)",
    vacuum: "var(--kind-vacuum)",
    humidifier: "var(--kind-humidifier)",
    alarm_control_panel: "var(--kind-alarm)"
  };
  return map[kind] ?? "var(--kind-generic)";
}

/** Generic "does this tile look active/highlighted" check. Locked counts as active (secure); unlocked does not. */
export function isOn(entity: HassEntity): boolean {
  return !["off", "closed", "unlocked", "unavailable", "unknown", "idle"].includes(entity.state);
}

export function friendlyName(entity: HassEntity): string {
  return (entity.attributes.friendly_name as string | undefined) ?? entity.entity_id;
}

export function brightnessPct(entity: HassEntity): number {
  const b = entity.attributes.brightness as number | undefined;
  if (entity.state === "off" || b == null) return 0;
  return Math.round((b / 255) * 100);
}

export function coverPositionPct(entity: HassEntity): number {
  const p = entity.attributes.current_position as number | undefined;
  if (p != null) return p;
  return entity.state === "open" ? 100 : 0;
}

export function volumePct(entity: HassEntity): number {
  const v = entity.attributes.volume_level as number | undefined;
  return v != null ? Math.round(v * 100) : 0;
}

export function fanSpeedLabel(entity: HassEntity): "Low" | "Medium" | "High" {
  const pct = (entity.attributes.percentage as number | undefined) ?? 0;
  if (pct <= 33) return "Low";
  if (pct <= 66) return "Medium";
  return "High";
}

export function statusOf(entity: HassEntity, kind: Kind): string {
  switch (kind) {
    case "climate": {
      const action = entity.attributes.hvac_action as string | undefined;
      if (action && action !== "off") return action[0]!.toUpperCase() + action.slice(1);
      return entity.state === "off" ? "Off" : "Idle";
    }
    case "sensor": {
      const unit = entity.attributes.unit_of_measurement as string | undefined;
      return unit ? `${entity.state}${unit}` : entity.state;
    }
    case "binary_sensor":
      return isOn(entity) ? "Detected" : "Clear";
    case "lock":
      if (entity.state === "locking") return "Locking…";
      if (entity.state === "unlocking") return "Unlocking…";
      return entity.state === "locked" ? "Locked" : "Unlocked";
    case "camera":
      return entity.state === "recording" || entity.state === "streaming" ? "Live" : "Idle";
    case "cover": {
      const pct = coverPositionPct(entity);
      if (entity.state === "closed") return "Closed";
      return pct >= 100 ? "Open" : `Open ${pct}%`;
    }
    case "media_player":
      return entity.state === "playing" ? `Playing · ${volumePct(entity)}%` : entity.state === "off" ? "Off" : "Paused";
    case "light":
      return entity.state === "off" ? "Off" : `${brightnessPct(entity)}%`;
    case "fan":
      return entity.state === "off" ? "Off" : fanSpeedLabel(entity);
    case "vacuum":
      return entity.state[0]!.toUpperCase() + entity.state.slice(1);
    default:
      return isOn(entity) ? "On" : "Off";
  }
}

export function statusIsWarning(entity: HassEntity, kind: Kind): boolean {
  return kind === "lock" && entity.state !== "locked";
}
