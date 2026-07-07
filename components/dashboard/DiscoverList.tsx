"use client";

import { Icon } from "../ds/Icon";
import { useAutomations } from "../../hooks/useDashboard";
import { getHaClient } from "../../lib/ha/client";
import styles from "./ListRow.module.css";

/**
 * "Suggested for your home" — HA has no suggestion API, so this surfaces
 * automations you already have but haven't turned on yet, as a genuinely
 * useful (not fabricated) starting point for Discover.
 */
export function DiscoverList() {
  const automations = useAutomations().filter((a) => !a.on);

  if (automations.length === 0) {
    return <div style={{ opacity: 0.5, fontSize: 13.5 }}>Nothing to suggest right now — every automation is already enabled.</div>;
  }

  return (
    <div className={styles.grid}>
      {automations.map((a) => (
        <div key={a.entityId} className={styles.row}>
          <span className={styles.icon} style={{ background: "var(--kind-fan)" }}>
            <Icon kind="clock" color="#fff" size={17} />
          </span>
          <span className={styles.col}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.detail}>Currently disabled</span>
          </span>
          <button
            className={styles.addBtn}
            onClick={() =>
              getHaClient()
                .callService("automation", "turn_on", { entity_id: a.entityId })
                .catch((err) => console.error("[enable automation]", err))
            }
          >
            Enable
          </button>
        </div>
      ))}
    </div>
  );
}
