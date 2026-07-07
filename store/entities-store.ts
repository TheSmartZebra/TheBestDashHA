import { create } from "zustand";
import type { HassEntities, RegistrySnapshot } from "../lib/ha/types";

interface EntitiesState {
  status: "connecting" | "connected" | "disconnected";
  states: HassEntities;
  registries: RegistrySnapshot;
  setStatus: (status: EntitiesState["status"]) => void;
  setStates: (states: HassEntities) => void;
  setRegistries: (registries: RegistrySnapshot) => void;
}

export const useEntitiesStore = create<EntitiesState>((set) => ({
  status: "connecting",
  states: {},
  registries: { areas: [], devices: [], entities: [] },
  setStatus: (status) => set({ status }),
  setStates: (states) => set({ states }),
  setRegistries: (registries) => set({ registries })
}));

/** Selector hook: subscribe to exactly one entity so unrelated tiles don't re-render. */
export function useEntity(entityId: string | undefined) {
  return useEntitiesStore((s) => (entityId ? s.states[entityId] : undefined));
}

export function useAllStates() {
  return useEntitiesStore((s) => s.states);
}

export function useRegistries() {
  return useEntitiesStore((s) => s.registries);
}

export function useConnectionStatus() {
  return useEntitiesStore((s) => s.status);
}
