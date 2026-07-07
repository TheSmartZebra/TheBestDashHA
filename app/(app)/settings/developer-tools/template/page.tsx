"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "../../../../../components/layout/Header";
import { getHaClient } from "../../../../../lib/ha/client";
import adminStyles from "../../../../../components/admin/admin.module.css";

const DEFAULT_TEMPLATE = `{# Live-updating: edit and re-render, or wait for tracked entities to change #}
The time is {{ now() }}.

{% for state in states.light %}
- {{ state.entity_id }}: {{ state.state }}
{% endfor %}`;

export default function DevToolsTemplatePage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [rendered, setRendered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    unsubRef.current?.();
    const timer = setTimeout(async () => {
      try {
        const unsub = await getHaClient().subscribeTemplate(template, (result) => {
          if (cancelled) return;
          setRendered(result.result);
          setError(result.error ?? null);
        });
        if (cancelled) unsub();
        else unsubRef.current = unsub;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubRef.current?.();
    };
  }, [template]);

  return (
    <>
      <Header title="Developer Tools · Template" showEdit={false} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div className={adminStyles.label} style={{ marginTop: 0 }}>
            Template
          </div>
          <textarea className={adminStyles.textarea} rows={20} value={template} onChange={(e) => setTemplate(e.target.value)} />
        </div>
        <div>
          <div className={adminStyles.label} style={{ marginTop: 0 }}>
            Rendered result (updates live)
          </div>
          <div
            className={adminStyles.tableWrap}
            style={{ padding: 14, minHeight: 400, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}
          >
            {error ? <span style={{ color: "var(--danger)" }}>{error}</span> : rendered}
          </div>
        </div>
      </div>
    </>
  );
}
