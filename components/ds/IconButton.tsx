"use client";

import type { ReactNode } from "react";
import styles from "./ds.module.css";

export function IconButton({
  onClick,
  children,
  active,
  title
}: {
  onClick?: () => void;
  children: ReactNode;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${styles.iconButton} ${active ? styles.iconButtonActive : ""}`}
    >
      {children}
    </button>
  );
}
