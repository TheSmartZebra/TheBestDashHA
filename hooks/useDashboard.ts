"use client";

import { useMemo } from "react";
import { useAllStates, useRegistries } from "../store/entities-store";
import { allTiles, automationList, cameraList, groupByArea, scenesAndScripts, statCardData, summaryLine } from "../lib/ha/dashboard";
import type { Category } from "../lib/ha/entity-model";

export function useTiles() {
  const states = useAllStates();
  const registries = useRegistries();
  return useMemo(() => allTiles(states, registries), [states, registries]);
}

export function useStatCards() {
  const states = useAllStates();
  const tiles = useTiles();
  return useMemo(() => statCardData(states, tiles), [states, tiles]);
}

export function useSummary() {
  const states = useAllStates();
  const tiles = useTiles();
  return useMemo(() => summaryLine(states, tiles), [states, tiles]);
}

export function useRoomSections(filter?: { areaLabel?: string; category?: Category }) {
  const tiles = useTiles();
  return useMemo(() => {
    let filtered = tiles.filter((t) => t.kind !== "camera");
    if (filter?.areaLabel) filtered = filtered.filter((t) => t.areaLabel === filter.areaLabel);
    if (filter?.category) filtered = filtered.filter((t) => t.category === filter.category);
    const grouped = groupByArea(filtered);
    return Array.from(grouped.entries()).map(([areaLabel, entries]) => ({ areaLabel, entries }));
  }, [tiles, filter?.areaLabel, filter?.category]);
}

export function useCameras(filter?: { areaLabel?: string }) {
  const tiles = useTiles();
  return useMemo(() => {
    const cams = cameraList(tiles);
    return filter?.areaLabel ? cams.filter((c) => c.areaLabel === filter.areaLabel) : cams;
  }, [tiles, filter?.areaLabel]);
}

export function useScenes() {
  const states = useAllStates();
  return useMemo(() => scenesAndScripts(states), [states]);
}

export function useAutomations() {
  const states = useAllStates();
  return useMemo(() => automationList(states), [states]);
}

export function useAreaList() {
  const registries = useRegistries();
  return registries.areas;
}
