"use client";

import { useState } from "react";
import { Header } from "../../../../components/layout/Header";
import { getHaClient } from "../../../../lib/ha/client";
import { useRegistries } from "../../../../store/entities-store";
import adminStyles from "../../../../components/admin/admin.module.css";

export default function AreasDashboardsPage() {
  const registries = useRegistries();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({ type: "config/area_registry/create", name: newName.trim() });
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function rename(areaId: string) {
    if (!editName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({ type: "config/area_registry/update", area_id: areaId, name: editName.trim() });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(areaId: string, name: string) {
    if (!confirm(`Delete area "${name}"? Devices/entities assigned to it will become unassigned.`)) return;
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({ type: "config/area_registry/delete", area_id: areaId });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const deviceCount = (areaId: string) => registries.devices.filter((d) => d.area_id === areaId).length;
  const entityCount = (areaId: string) => registries.entities.filter((e) => e.area_id === areaId).length;

  return (
    <>
      <Header title="Areas & Dashboards" summary={`${registries.areas.length} areas`} showEdit={false} />
      {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>{error}</div> : null}

      <div className={adminStyles.card} style={{ maxWidth: 480 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Add an area</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            className={adminStyles.search}
            placeholder="e.g. Garage"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={create} disabled={busy || !newName.trim()}>
            Add
          </button>
        </div>
      </div>

      <div className={adminStyles.tableWrap}>
        {registries.areas.length === 0 ? (
          <div className={adminStyles.empty}>No areas yet.</div>
        ) : (
          registries.areas.map((a) => (
            <div key={a.area_id} className={adminStyles.tableRow} style={{ cursor: "default", height: "auto", padding: "10px 16px" }}>
              {editing === a.area_id ? (
                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  <input className={adminStyles.search} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={() => rename(a.area_id)}>
                    Save
                  </button>
                  <button className={adminStyles.button} onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 600 }}>{a.name}</span>
                  <span style={{ opacity: 0.5, fontSize: 12, marginRight: 14 }}>
                    {deviceCount(a.area_id)} devices · {entityCount(a.area_id)} entities
                  </span>
                  <button
                    className={adminStyles.button}
                    onClick={() => {
                      setEditing(a.area_id);
                      setEditName(a.name);
                    }}
                  >
                    Rename
                  </button>
                  <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} style={{ marginLeft: 8 }} onClick={() => remove(a.area_id, a.name)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className={adminStyles.card} style={{ marginTop: 20, fontSize: 12.5, opacity: 0.6, lineHeight: 1.6 }}>
        Rooms in the sidebar are generated directly from these areas — add, rename, or remove an area here and the
        dashboard's Rooms list updates immediately.
      </div>
    </>
  );
}
