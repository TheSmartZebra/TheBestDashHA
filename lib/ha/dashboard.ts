import type { HassEntities, RegistrySnapshot } from "./types";
import {
  areaName,
  categoryOfKind,
  domainOf,
  effectiveAreaId,
  isHidden,
  isOn,
  isTileEntity,
  kindOf,
  type Category,
  type Kind
} from "./entity-model";

export interface TileEntry {
  entityId: string;
  kind: Kind;
  category: Category;
  areaId: string | null;
  areaLabel: string;
}

export function allTiles(states: HassEntities, registries: RegistrySnapshot): TileEntry[] {
  return Object.keys(states)
    .filter((id) => isTileEntity(id) && !isHidden(id, registries))
    .map((entityId) => {
      const entity = states[entityId]!;
      const kind = kindOf(entity);
      const areaId = effectiveAreaId(entityId, registries);
      return {
        entityId,
        kind,
        category: categoryOfKind(kind),
        areaId,
        areaLabel: areaName(areaId, registries)
      };
    });
}

export function groupByArea(tiles: TileEntry[]): Map<string, TileEntry[]> {
  const map = new Map<string, TileEntry[]>();
  for (const t of tiles) {
    const key = t.areaLabel;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

export function statCardData(states: HassEntities, tiles: TileEntry[]) {
  const climate = tiles.filter((t) => t.category === "climate");
  const lights = tiles.filter((t) => t.category === "lights");
  const security = tiles.filter((t) => t.category === "security");
  const cameras = tiles.filter((t) => t.category === "cameras");
  const media = tiles.filter((t) => t.category === "media");

  const lightsOn = lights.filter((t) => isOn(states[t.entityId]!)).length;
  const anyLockUnlocked = security.some((t) => states[t.entityId]!.state === "unlocked");
  const camsLive = cameras.filter((t) => ["recording", "streaming"].includes(states[t.entityId]!.state)).length;
  const mediaOn = media.filter((t) => isOn(states[t.entityId]!)).length;

  const thermostat = climate.find((t) => t.kind === "climate");
  const climateStatus = thermostat
    ? `${states[thermostat.entityId]!.attributes.current_temperature ?? "--"}°`
    : climate.length
      ? "On"
      : "--";

  return [
    { key: "climate" as const, anyOn: climate.some((t) => isOn(states[t.entityId]!)), status: climateStatus, count: climate.length },
    { key: "lights" as const, anyOn: lightsOn > 0, status: lightsOn ? `${lightsOn} On` : "All Off", count: lights.length },
    { key: "security" as const, anyOn: !anyLockUnlocked && security.length > 0, status: security.length === 0 ? "--" : anyLockUnlocked ? "Unlocked" : "All Secure", count: security.length },
    { key: "cameras" as const, anyOn: camsLive > 0, status: `${camsLive} Live`, count: cameras.length },
    { key: "media" as const, anyOn: mediaOn > 0, status: mediaOn ? `${mediaOn} Playing` : "Off", count: media.length }
  ];
}

export function summaryLine(states: HassEntities, tiles: TileEntry[]): string {
  const lights = tiles.filter((t) => t.category === "lights");
  const lightsOn = lights.filter((t) => isOn(states[t.entityId]!)).length;
  const thermostat = tiles.find((t) => t.kind === "climate");
  const lock = tiles.find((t) => t.kind === "lock");

  const parts: string[] = [];
  parts.push(`${lightsOn} light${lightsOn === 1 ? "" : "s"} on`);
  if (thermostat) {
    const temp = states[thermostat.entityId]!.attributes.current_temperature;
    if (temp != null) parts.push(`${temp}° inside`);
  }
  if (lock) {
    parts.push(states[lock.entityId]!.state === "locked" ? "Front door locked" : "Front door unlocked");
  }
  return parts.join(" · ");
}

const SCENE_ICON_RULES: [RegExp, string][] = [
  [/morning|wake/i, "sun"],
  [/night|bed/i, "moon"],
  [/movie|film|theat/i, "film"],
  [/home|arrive|welcome/i, "door"]
];

export function sceneIcon(name: string): string {
  for (const [re, icon] of SCENE_ICON_RULES) {
    if (re.test(name)) return icon;
  }
  return "diamond";
}

export function scenesAndScripts(states: HassEntities) {
  return Object.keys(states)
    .filter((id) => domainOf(id) === "scene" || domainOf(id) === "script")
    .map((entityId) => ({
      entityId,
      domain: domainOf(entityId) as "scene" | "script",
      configId: states[entityId]!.attributes.id as string | undefined,
      name: (states[entityId]!.attributes.friendly_name as string) ?? entityId,
      icon: sceneIcon((states[entityId]!.attributes.friendly_name as string) ?? entityId)
    }));
}

export function automationList(states: HassEntities) {
  return Object.keys(states)
    .filter((id) => domainOf(id) === "automation")
    .map((entityId) => {
      const e = states[entityId]!;
      const lastTriggered = e.attributes.last_triggered as string | undefined;
      return {
        entityId,
        configId: e.attributes.id as string | undefined,
        name: (e.attributes.friendly_name as string) ?? entityId,
        on: e.state === "on",
        detail: lastTriggered ? `Last run ${new Date(lastTriggered).toLocaleString()}` : "Never triggered"
      };
    });
}

export function cameraList(tiles: TileEntry[]) {
  return tiles.filter((t) => t.kind === "camera");
}
