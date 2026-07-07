"use client";

import type { ReactNode } from "react";
import styles from "./ds.module.css";

export function StatCard({
  icon,
  iconBg,
  label,
  status,
  selected,
  onClick
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  status: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`${styles.statCard} ${selected ? styles.statCardSelected : ""}`}>
      <span className={styles.statCardIcon} style={{ background: iconBg }}>
        {icon}
      </span>
      <span className={styles.statCardBody}>
        <span className={styles.statCardLabel}>{label}</span>
        <span className={styles.statCardStatus}>{status}</span>
      </span>
    </button>
  );
}
