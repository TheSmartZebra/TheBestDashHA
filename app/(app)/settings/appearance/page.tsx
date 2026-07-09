"use client";

import { Header } from "../../../../components/layout/Header";
import { useAppSettings } from "../../../../components/providers/AppSettingsProvider";
import type { ThemeMode, Tint } from "../../../../lib/ha/types";
import styles from "./appearance.module.css";

const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

const TINTS: { value: Tint; label: string; swatch: string }[] = [
  { value: "Granite", label: "Granite", swatch: "linear-gradient(160deg, #3a3a3d, #0d0d0f)" },
  { value: "Graphite", label: "Graphite", swatch: "linear-gradient(160deg, #3a3b44, #101116)" },
  { value: "Indigo", label: "Indigo", swatch: "linear-gradient(160deg, #3a3d5c, #101222)" },
  { value: "Mocha", label: "Mocha", swatch: "linear-gradient(160deg, #4a3a30, #13100d)" }
];

const ACCENTS = [
  { hex: "#F5A623", name: "Gold" },
  { hex: "#22B8C9", name: "Teal" },
  { hex: "#FF6B4A", name: "Coral" },
  { hex: "#A855F7", name: "Violet" },
  { hex: "#35C281", name: "Sage" },
  { hex: "#3F8CF3", name: "Sky" }
];

export default function AppearancePage() {
  const { settings, setThemeMode, setTint, setAccent } = useAppSettings();

  return (
    <>
      <Header title="Appearance" summary="Theme, accent color, and background tint" showEdit={false} />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Theme</div>
        <div className={styles.segmented}>
          {THEME_MODES.map((m) => (
            <button
              key={m.value}
              className={`${styles.segment} ${settings.themeMode === m.value ? styles.segmentActive : ""}`}
              onClick={() => setThemeMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Background tint</div>
        <div className={styles.swatchRow}>
          {TINTS.map((t) => (
            <button
              key={t.value}
              className={`${styles.tintSwatch} ${settings.tint === t.value ? styles.swatchActive : ""}`}
              style={{ background: t.swatch }}
              onClick={() => setTint(t.value)}
              title={t.label}
            >
              {settings.tint === t.value ? <span className={styles.check} /> : null}
              <span className={styles.tintLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Accent color</div>
        <div className={styles.swatchRow}>
          {ACCENTS.map((a) => (
            <button
              key={a.hex}
              className={`${styles.colorSwatch} ${settings.accent.toLowerCase() === a.hex.toLowerCase() ? styles.swatchActive : ""}`}
              style={{ background: a.hex }}
              onClick={() => setAccent(a.hex)}
              title={a.name}
              aria-label={`${a.name} accent color`}
            >
              {settings.accent.toLowerCase() === a.hex.toLowerCase() ? <span className={styles.check} /> : null}
            </button>
          ))}
          <label className={styles.customSwatch} title="Custom color">
            <input
              type="color"
              value={settings.accent}
              onChange={(e) => setAccent(e.target.value)}
              className={styles.colorInput}
              aria-label="Custom accent color"
            />
          </label>
        </div>
      </div>
    </>
  );
}
