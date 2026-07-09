"use client";

import { Icon } from "../ds/Icon";
import { ToggleSwitch } from "../ds/ToggleSwitch";
import { useAutomations } from "../../hooks/useDashboard";
import { getHaClient } from "../../lib/ha/client";
import styles from "./ListRow.module.css";

export function AutomationList() {
  const automations = useAutomations();

  if (automations.length === 0) {
    return <div style={{ opacity: 0.5, fontSize: 13.5 }}>No automations found in Home Assistant yet.</div>;
  }

  return (
    <div className={styles.grid}>
      {automations.map((a) => (
        <div key={a.entityId} className={styles.row}>
          <span className={styles.icon} style={{ background: a.on ? "var(--kind-fan)" : "var(--icon-off-bg)" }}>
            <Icon kind="clock" color={a.on ? "#fff" : "var(--ink-dim)"} size={17} />
          </span>
          <span className={styles.col}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.detail}>{a.detail}</span>
          </span>
          <ToggleSwitch
            on={a.on}
            onClick={() =>
              getHaClient()
                .callService("automation", a.on ? "turn_off" : "turn_on", { entity_id: a.entityId })
                .catch((err) => console.error("[automation toggle]", err))
            }
          />
        </div>
      ))}
    </div>
  );
}
