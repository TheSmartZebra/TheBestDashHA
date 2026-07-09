"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useConnectionStatus } from "../../store/entities-store";
import { useUiStore } from "../../store/ui-store";
import { useAppSettings } from "../providers/AppSettingsProvider";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const status = useConnectionStatus();
  const edit = useUiStore((s) => s.edit);
  const router = useRouter();
  const { settings, loaded } = useAppSettings();

  useEffect(() => {
    if (loaded && !settings.onboarded) router.replace("/setup");
  }, [loaded, settings.onboarded, router]);

  if (!loaded || !settings.onboarded) return null;

  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.mainInner}>
          {status !== "connected" ? (
            <div className={styles.disconnectedBanner}>
              {status === "connecting" ? "Connecting to Home Assistant…" : "Disconnected from Home Assistant — reconnecting…"}
            </div>
          ) : null}
          {edit ? (
            <div className={styles.disconnectedBanner} style={{ background: "var(--surface-glass-hi)", color: "var(--ink)" }}>
              Tap any accessory to pin or unpin it from Favorites. Tap the sliders button again when finished.
            </div>
          ) : null}
          {children}
          <div className={styles.footNote}>
            Tap a tile to toggle · drag lights &amp; blinds to adjust · hold the lock to unlock · sliders button to pin favorites · ⋯ for Home Assistant settings
          </div>
        </div>
      </div>
    </div>
  );
}
