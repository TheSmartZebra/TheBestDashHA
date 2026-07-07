"use client";

import { useState } from "react";
import type { HassEntity } from "../../lib/ha/types";
import adminStyles from "./admin.module.css";

export function StateEditorDrawer({ entity, onClose }: { entity: HassEntity; onClose: () => void }) {
  const [state, setState] = useState(entity.state);
  const [attrsText, setAttrsText] = useState(JSON.stringify(entity.attributes, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setError(null);
    let attributes: unknown;
    try {
      attributes = JSON.parse(attrsText);
    } catch {
      setError("Attributes must be valid JSON.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/ha/states/${entity.entity_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, attributes })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? body.error ?? "Failed to set state.");
        return;
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={adminStyles.drawerBackdrop} onClick={onClose} />
      <div className={adminStyles.drawer}>
        <div className={adminStyles.drawerTitle}>{entity.entity_id}</div>

        <div className={adminStyles.label}>State</div>
        <input className={adminStyles.search} value={state} onChange={(e) => setState(e.target.value)} />

        <div className={adminStyles.label}>Attributes (JSON)</div>
        <textarea
          className={adminStyles.textarea}
          rows={16}
          value={attrsText}
          onChange={(e) => setAttrsText(e.target.value)}
        />

        {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div> : null}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className={adminStyles.button} onClick={onClose}>
            Cancel
          </button>
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={save} disabled={saving}>
            {saving ? "Setting…" : "Set State"}
          </button>
        </div>
      </div>
    </>
  );
}
