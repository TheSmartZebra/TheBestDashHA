"use client";

import { TileShell } from "./TileShell";
import { IconCircle } from "./visuals/IconCircle";
import { FillBar } from "./visuals/FillBar";
import { ClimateVisual } from "./visuals/ClimateVisual";
import { FanPill } from "./visuals/FanPill";
import { Steppers } from "./visuals/Steppers";
import { useEntity } from "../../store/entities-store";
import { useUiStore } from "../../store/ui-store";
import { useAppSettings } from "../providers/AppSettingsProvider";
import { useTileGesture } from "../../hooks/useTileGesture";
import {
  brightnessPct,
  coverPositionPct,
  friendlyName,
  isOn,
  kindColorVar,
  kindOf,
  statusIsWarning,
  statusOf,
  type Kind
} from "../../lib/ha/entity-model";

const NO_PIN_KINDS = new Set<Kind>(["sensor", "binary_sensor"]);

export function Tile({ entityId, variant }: { entityId: string; variant: "row" | "favorite" }) {
  const entity = useEntity(entityId);
  const { edit } = useUiStore();
  const { isPinned, togglePin } = useAppSettings();

  if (!entity) return null;
  const kind = kindOf(entity);

  const { handlers, dragPct, holding, actions } = useTileGesture({
    entity,
    kind,
    vertical: variant === "favorite" && (kind === "light" || kind === "media_player"),
    editMode: edit,
    onTogglePin: () => togglePin(entityId)
  });

  const onForStyle = kind === "sensor" ? false : isOn(entity);
  const name = friendlyName(entity);

  let status = statusOf(entity, kind);
  if (kind === "climate" && variant === "favorite") {
    const target = entity.attributes.temperature as number | undefined;
    const action = (entity.attributes.hvac_action as string | undefined) ?? (entity.state !== "off" ? "on" : "off");
    status = entity.state === "off" ? "Off" : `${action === "off" ? "Idle" : action[0]!.toUpperCase() + action.slice(1)}${target != null ? ` to ${target.toFixed(1)}°` : ""}`;
  }

  let visual: React.ReactNode;
  switch (kind) {
    case "light":
      visual = (
        <FillBar
          pct={dragPct ?? (entity.state === "off" ? 0 : brightnessPct(entity))}
          orientation={variant === "favorite" ? "vertical" : "horizontal"}
          variant={variant}
        />
      );
      break;
    case "cover":
      visual = (
        <FillBar
          pct={dragPct ?? coverPositionPct(entity)}
          orientation={variant === "favorite" ? "vertical" : "horizontal"}
          variant={variant}
        />
      );
      break;
    case "climate":
      visual = <ClimateVisual entity={entity} size={variant === "favorite" ? 92 : 46} onCommit={actions.setClimateTemp} />;
      break;
    default:
      visual = (
        <IconCircle
          kind={kind === "lock" && entity.state !== "locked" ? "unlock" : kind}
          on={onForStyle}
          colorVar={kindColorVar(kind)}
          size={variant === "favorite" ? 64 : 40}
        />
      );
  }

  let controls: React.ReactNode = null;
  if (kind === "fan" && !edit && entity.state === "on") {
    controls = <FanPill label={statusOf(entity, kind)} onClick={() => actions.cycleFanSpeed(entity)} />;
  }
  if (kind === "climate" && !edit && entity.state !== "off") {
    const step = (entity.attributes.target_temp_step as number | undefined) ?? 0.5;
    const target = (entity.attributes.temperature as number | undefined) ?? 21;
    controls = (
      <Steppers
        size={variant === "favorite" ? 28 : 26}
        onDown={() => actions.setClimateTemp(target - step)}
        onUp={() => actions.setClimateTemp(target + step)}
      />
    );
  }

  const canPin = !NO_PIN_KINDS.has(kind);

  return (
    <TileShell
      variant={variant}
      on={onForStyle}
      holding={holding}
      editMode={edit}
      pinned={isPinned(entityId)}
      onTogglePin={canPin ? () => togglePin(entityId) : undefined}
      name={name}
      status={status}
      statusWarn={statusIsWarning(entity, kind)}
      visual={visual}
      controls={controls}
      clickable={kind !== "sensor" && kind !== "binary_sensor"}
      {...handlers}
    />
  );
}
