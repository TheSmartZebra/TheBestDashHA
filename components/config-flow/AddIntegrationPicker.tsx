"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { configFlow } from "../../lib/ha/config-flow";
import { FlowRunner } from "./FlowRunner";
import adminStyles from "../admin/admin.module.css";
import styles from "./FlowRunner.module.css";

export function AddIntegrationPicker({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { data: handlers } = useQuery({ queryKey: ["flow_handlers"], queryFn: () => configFlow.listHandlers() });
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = handlers ?? [];
    return (q ? all.filter((h) => h.toLowerCase().includes(q)) : all).slice(0, 60);
  }, [handlers, query]);

  if (domain) {
    return <FlowRunner start={() => configFlow.start(domain)} onClose={onClose} onDone={onDone} />;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Add Integration</div>
        <input
          className={adminStyles.search}
          style={{ marginTop: 12 }}
          placeholder="Search integrations…"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ marginTop: 10, maxHeight: 360, overflowY: "auto" }}>
          {filtered.map((h) => (
            <button key={h} className={styles.menuBtn} onClick={() => setDomain(h)}>
              {h}
            </button>
          ))}
          {filtered.length === 0 ? <div className={adminStyles.empty}>No matches.</div> : null}
        </div>
        <div className={styles.actions}>
          <button className={adminStyles.button} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
