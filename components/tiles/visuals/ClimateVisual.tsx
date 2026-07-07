"use client";

import { RingGauge } from "../../ds/RingGauge";
import { useThermostatDrag } from "../../../hooks/useThermostatDrag";
import type { HassEntity } from "../../../lib/ha/types";

export function ClimateVisual({
  entity,
  size,
  onCommit
}: {
  entity: HassEntity;
  size: number;
  onCommit: (temp: number) => void;
}) {
  const min = (entity.attributes.min_temp as number | undefined) ?? 15;
  const max = (entity.attributes.max_temp as number | undefined) ?? 28;
  const step = (entity.attributes.target_temp_step as number | undefined) ?? 0.5;
  const target = (entity.attributes.temperature as number | undefined) ?? (entity.attributes.current_temperature as number | undefined) ?? min;

  const { ref, dragValue, handlers } = useThermostatDrag(min, max, step, onCommit);
  const value = dragValue ?? target;
  const frac = (value - min) / (max - min);

  return (
    <span ref={ref} {...handlers} style={{ display: "inline-flex", flex: "none", cursor: "grab", touchAction: "none" }}>
      <RingGauge frac={frac} size={size} color="var(--kind-climate)" label={`${value.toFixed(1)}°`} />
    </span>
  );
}
