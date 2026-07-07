import type { ReactNode } from "react";
import styles from "./Section.module.css";

export function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
        {sub ? <span className={styles.sub}>{sub}</span> : null}
      </div>
      {children}
    </div>
  );
}

export { styles as sectionStyles };
