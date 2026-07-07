"use client";

import type { ReactNode, HTMLAttributes } from "react";
import styles from "./TileShell.module.css";

interface TileShellProps extends HTMLAttributes<HTMLDivElement> {
  variant: "row" | "favorite";
  on: boolean;
  holding?: boolean;
  editMode?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  name: string;
  status: string;
  statusWarn?: boolean;
  visual: ReactNode;
  controls?: ReactNode;
  clickable?: boolean;
}

export function TileShell({
  variant,
  on,
  holding,
  editMode,
  pinned,
  onTogglePin,
  name,
  status,
  statusWarn,
  visual,
  controls,
  clickable = true,
  style,
  ...rest
}: TileShellProps) {
  const holdGlow = holding
    ? "0 0 0 2px var(--accent), 0 6px 18px rgba(0,0,0,.3)"
    : on
      ? "var(--shadow-active)"
      : "var(--shadow-rest)";

  const pin = editMode && onTogglePin ? (
    <span
      className={`${styles.pinDot} ${pinned ? styles.pinDotOn : styles.pinDotOff}`}
      onClick={(e) => {
        e.stopPropagation();
        onTogglePin?.();
      }}
    />
  ) : null;

  if (variant === "favorite") {
    return (
      <div
        {...rest}
        className={`${styles.favorite} ${on ? styles.on : styles.off} ${clickable ? styles.clickable : ""} ${editMode ? styles.editOutline : ""}`}
        style={{ boxShadow: holdGlow, ...style }}
      >
        <div className={styles.favTop}>
          {visual}
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {controls}
            {pin}
          </span>
        </div>
        <div className={styles.favFoot}>
          <div className={styles.favName}>{name}</div>
          <div className={`${styles.favStatus} ${statusWarn ? styles.favStatusWarn : ""}`}>{status}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={`${styles.row} ${on ? styles.on : styles.off} ${clickable ? styles.clickable : ""} ${editMode ? styles.editOutline : ""}`}
      style={{ boxShadow: holdGlow, ...style }}
    >
      {visual}
      <span className={styles.rowNameCol}>
        <span className={styles.rowName}>{name}</span>
        <span className={`${styles.rowStatus} ${statusWarn ? styles.rowStatusWarn : ""}`}>{status}</span>
      </span>
      {controls}
      {pin}
    </div>
  );
}
