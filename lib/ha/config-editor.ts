import { haRest } from "./rest";

/**
 * HA's generic "config" component exposes a GET/POST-per-id REST API for a
 * handful of YAML-backed domains (automation, scene, script) at
 * /api/config/{domain}/config/{id} -- POSTing to an id that doesn't exist
 * yet creates it. This wraps that pattern.
 */
export const configEditor = {
  get: (domain: "automation" | "scene" | "script", id: string) => haRest.get<Record<string, unknown>>(`config/${domain}/config/${id}`),
  save: (domain: "automation" | "scene" | "script", id: string, config: Record<string, unknown>) =>
    haRest.post<{ result: string }>(`config/${domain}/config/${id}`, config),
  remove: (domain: "automation" | "scene" | "script", id: string) => haRest.del<void>(`config/${domain}/config/${id}`)
};

export function newConfigId(): string {
  return Date.now().toString();
}
