"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAllStates, useConnectionStatus, useRegistries } from "../../store/entities-store";
import { useAppSettings } from "../../components/providers/AppSettingsProvider";
import { EntityVisibilityEditor } from "../../components/setup/EntityVisibilityEditor";
import { allTiles } from "../../lib/ha/dashboard";
import styles from "./page.module.css";

export default function SetupPage() {
  const router = useRouter();
  const status = useConnectionStatus();
  const states = useAllStates();
  const registries = useRegistries();
  const { settings, loaded, completeOnboarding } = useAppSettings();

  const tiles = useMemo(() => allTiles(states, registries), [states, registries]);

  const initialVisible = useMemo(() => {
    const isFirstRun = !settings.onboarded && settings.hiddenEntities.length === 0;
    if (isFirstRun) {
      // Diagnostic-only sensors/binary_sensors (Wi-Fi signal, "update available", link
      // quality, etc.) are technically tile-eligible but rarely dashboard-worthy, so they're
      // excluded from the default selection (still addable manually). Single pass over the
      // registry to build a lookup set, rather than re-scanning registries.entities per tile.
      const diagnosticIds = new Set(
        registries.entities.filter((e) => e.entity_category === "diagnostic").map((e) => e.entity_id)
      );
      return new Set(
        tiles
          .filter((t) => !((t.kind === "sensor" || t.kind === "binary_sensor") && diagnosticIds.has(t.entityId)))
          .map((t) => t.entityId)
      );
    }
    const hidden = new Set(settings.hiddenEntities);
    return new Set(tiles.map((t) => t.entityId).filter((id) => !hidden.has(id)));
  }, [tiles, registries, settings.onboarded, settings.hiddenEntities]);

  function save(visible: Set<string>) {
    const hiddenEntities = tiles.map((t) => t.entityId).filter((id) => !visible.has(id));
    completeOnboarding(hiddenEntities);
    router.push("/");
  }

  function showEverything() {
    completeOnboarding([]);
    router.push("/");
  }

  const ready = loaded && status === "connected";

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.title}>Welcome to My Home</div>
          <div className={styles.sub}>
            We found {tiles.length} entities across your Home Assistant areas. We&apos;ve pre-selected the ones most
            people want on a dashboard — uncheck anything you&apos;d rather not see, or add back what you need. You
            can change this anytime from Settings.
          </div>
        </div>

        {!ready ? (
          <div className={styles.loading}>{status === "connected" ? "Loading your settings…" : "Connecting to Home Assistant…"}</div>
        ) : (
          <EntityVisibilityEditor
            tiles={tiles}
            initialVisible={initialVisible}
            onSave={save}
            saveLabel="Save & Continue"
            secondaryAction={{ label: "Show everything", onClick: showEverything }}
          />
        )}
      </div>
    </div>
  );
}
