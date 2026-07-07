"use client";

import styles from "./ds.module.css";

export function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${styles.toggleSwitch} ${on ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
      aria-pressed={on}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}
