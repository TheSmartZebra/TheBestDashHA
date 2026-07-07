"use client";

import { useCallback } from "react";
import { getHaClient } from "../lib/ha/client";
import { domainOf, type Kind } from "../lib/ha/entity-model";
import type { HassEntity } from "../lib/ha/types";

export function useEntityActions(entityId: string, kind: Kind) {
  const client = getHaClient();
  const domain = domainOf(entityId);

  const toggle = useCallback(() => {
    void client.callService(domain, "toggle", { entity_id: entityId });
  }, [client, domain, entityId]);

  const setBrightnessPct = useCallback(
    (pct: number) => {
      if (pct <= 0) {
        void client.callService("light", "turn_off", { entity_id: entityId });
      } else {
        void client.callService("light", "turn_on", { entity_id: entityId }, { brightness_pct: pct });
      }
    },
    [client, entityId]
  );

  const setColorTempKelvin = useCallback(
    (kelvin: number) => {
      void client.callService("light", "turn_on", { entity_id: entityId }, { color_temp_kelvin: kelvin });
    },
    [client, entityId]
  );

  const setCoverPositionPct = useCallback(
    (pct: number) => {
      void client.callService("cover", "set_cover_position", { entity_id: entityId }, { position: pct });
    },
    [client, entityId]
  );

  const setVolumePct = useCallback(
    (pct: number) => {
      void client.callService("media_player", "volume_set", { entity_id: entityId }, { volume_level: pct / 100 });
    },
    [client, entityId]
  );

  const mediaPlayPause = useCallback(() => {
    void client.callService("media_player", "media_play_pause", { entity_id: entityId });
  }, [client, entityId]);

  const lock = useCallback(() => {
    void client.callService("lock", "lock", { entity_id: entityId });
  }, [client, entityId]);

  const unlock = useCallback(() => {
    void client.callService("lock", "unlock", { entity_id: entityId });
  }, [client, entityId]);

  const setFanPercentage = useCallback(
    (pct: number) => {
      void client.callService("fan", "set_percentage", { entity_id: entityId }, { percentage: pct });
    },
    [client, entityId]
  );

  const cycleFanSpeed = useCallback(
    (entity: HassEntity) => {
      const current = (entity.attributes.percentage as number | undefined) ?? 0;
      const next = current <= 0 ? 33 : current <= 33 ? 66 : current <= 66 ? 100 : 0;
      if (next === 0) void client.callService("fan", "turn_off", { entity_id: entityId });
      else void client.callService("fan", "set_percentage", { entity_id: entityId }, { percentage: next });
    },
    [client, entityId]
  );

  const setClimateTemp = useCallback(
    (temp: number) => {
      void client.callService("climate", "set_temperature", { entity_id: entityId }, { temperature: temp });
    },
    [client, entityId]
  );

  const activateScene = useCallback(() => {
    void client.callService(domain, domain === "script" ? "turn_on" : "turn_on", { entity_id: entityId });
  }, [client, domain, entityId]);

  const toggleAutomation = useCallback(
    (on: boolean) => {
      void client.callService("automation", on ? "turn_off" : "turn_on", { entity_id: entityId });
    },
    [client, entityId]
  );

  return {
    toggle,
    setBrightnessPct,
    setColorTempKelvin,
    setCoverPositionPct,
    setVolumePct,
    mediaPlayPause,
    lock,
    unlock,
    setFanPercentage,
    cycleFanSpeed,
    setClimateTemp,
    activateScene,
    toggleAutomation
  };
}
