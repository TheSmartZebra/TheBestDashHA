"use client";

import { useMemo, useState } from "react";
import { Header } from "../../../../../components/layout/Header";
import { useAllStates } from "../../../../../store/entities-store";
import { getHaClient } from "../../../../../lib/ha/client";
import { domainOf, friendlyName } from "../../../../../lib/ha/entity-model";
import adminStyles from "../../../../../components/admin/admin.module.css";

export default function SystemUpdatesPage() {
  const states = useAllStates();
  const [installing, setInstalling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updates = useMemo(
    () =>
      Object.values(states)
        .filter((e) => domainOf(e.entity_id) === "update")
        .sort((a, b) => Number(b.state === "on") - Number(a.state === "on")),
    [states]
  );

  const available = updates.filter((u) => u.state === "on");

  async function install(entityId: string) {
    setInstalling(entityId);
    setError(null);
    try {
      await getHaClient().callService("update", "install", { entity_id: entityId });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setInstalling(null);
    }
  }

  return (
    <>
      <Header title="System · Updates" summary={`${available.length} update${available.length === 1 ? "" : "s"} available`} showEdit={false} />
      {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>{error}</div> : null}
      <div className={adminStyles.tableWrap}>
        {updates.length === 0 ? (
          <div className={adminStyles.empty}>No update entities found on this Home Assistant instance.</div>
        ) : (
          updates.map((u) => (
            <div key={u.entity_id} className={adminStyles.tableRow} style={{ cursor: "default", height: "auto", padding: "12px 16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{friendlyName(u)}</div>
                <div style={{ fontSize: 12, opacity: 0.55 }}>
                  {u.attributes.installed_version ?? "—"} → {u.attributes.latest_version ?? "—"}
                </div>
              </div>
              {u.state === "on" ? (
                <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} disabled={installing === u.entity_id || !!u.attributes.in_progress} onClick={() => install(u.entity_id)}>
                  {u.attributes.in_progress ? "Installing…" : "Install"}
                </button>
              ) : (
                <span className={`${adminStyles.badge} ${adminStyles.badgeOn}`}>Up to date</span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
