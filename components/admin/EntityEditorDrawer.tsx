"use client";

import { useState } from "react";
import { getHaClient } from "../../lib/ha/client";
import { useRegistries } from "../../store/entities-store";
import type { EntityRegistryEntry } from "../../lib/ha/types";
import adminStyles from "./admin.module.css";

export function EntityEditorDrawer({ entry, onClose, onSaved }: { entry: EntityRegistryEntry; onClose: () => void; onSaved: () => void }) {
  const registries = useRegistries();
  const [name, setName] = useState(entry.name ?? "");
  const [areaId, setAreaId] = useState(entry.area_id ?? "");
  const [enabled, setEnabled] = useState(!entry.disabled_by);
  const [hidden, setHidden] = useState(!!entry.hidden_by);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await getHaClient().command({
        type: "config/entity_registry/update",
        entity_id: entry.entity_id,
        name: name || null,
        area_id: areaId || null,
        disabled_by: enabled ? null : "user",
        hidden_by: hidden ? "user" : null
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove ${entry.entity_id} from the registry?`)) return;
    setSaving(true);
    try {
      await getHaClient().command({ type: "config/entity_registry/remove", entity_id: entry.entity_id });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={adminStyles.drawerBackdrop} onClick={onClose} />
      <div className={adminStyles.drawer}>
        <div className={adminStyles.drawerTitle}>{entry.entity_id}</div>

        <div className={adminStyles.label} style={{ marginTop: 0 }}>
          Name
        </div>
        <input className={adminStyles.search} value={name} onChange={(e) => setName(e.target.value)} placeholder={entry.entity_id} />

        <div className={adminStyles.label}>Area</div>
        <select className={adminStyles.select} style={{ width: "100%" }} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          <option value="">Follow device / none</option>
          {registries.areas.map((a) => (
            <option key={a.area_id} value={a.area_id}>
              {a.name}
            </option>
          ))}
        </select>

        <div className={adminStyles.row} style={{ marginTop: 14 }}>
          <span style={{ fontSize: 13 }}>Enabled</span>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        </div>
        <div className={adminStyles.row}>
          <span style={{ fontSize: 13 }}>Hidden from dashboard</span>
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
        </div>

        {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div> : null}

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button className={adminStyles.button} onClick={onClose}>
            Cancel
          </button>
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} onClick={remove} disabled={saving} style={{ marginLeft: "auto" }}>
            Remove
          </button>
        </div>
      </div>
    </>
  );
}
