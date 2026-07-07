"use client";

import type { ReactNode } from "react";
import styles from "./ds.module.css";

export function ScenePill({ icon, iconBg, label, onClick }: { icon: ReactNode; iconBg: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={styles.pill}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: iconBg
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}
