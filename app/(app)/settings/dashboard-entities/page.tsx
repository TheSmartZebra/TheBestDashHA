"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../../../components/layout/Header";
import { EntityVisibilityEditor } from "../../../../components/setup/EntityVisibilityEditor";
import { useAllStates, useRegistries } from "../../../../store/entities-store";
import { useAppSettings } from "../../../../components/providers/AppSettingsProvider";
import { allTiles } from "../../../../lib/ha/dashboard";

export default function DashboardEntitiesPage() {
  const router = useRouter();
  const states = useAllStates();
  const registries = useRegistries();
  const { settings, setHiddenEntities } = useAppSettings();
  const [savedFlash, setSavedFlash] = useState(false);

  const tiles = useMemo(() => allTiles(states, registries), [states, registries]);
  const initialVisible = useMemo(() => {
    const hidden = new Set(settings.hiddenEntities);
    return new Set(tiles.map((t) => t.entityId).filter((id) => !hidden.has(id)));
  }, [tiles, settings.hiddenEntities]);

  function save(visible: Set<string>) {
    const hiddenEntities = tiles.map((t) => t.entityId).filter((id) => !visible.has(id));
    setHiddenEntities(hiddenEntities);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <>
      <Header title="Dashboard Entities" summary={savedFlash ? "Saved" : "Choose what shows up on your dashboard"} showEdit={false} />
      <EntityVisibilityEditor
        tiles={tiles}
        initialVisible={initialVisible}
        onSave={save}
        saveLabel="Save"
        secondaryAction={{ label: "Re-run setup wizard", onClick: () => router.push("/setup") }}
      />
    </>
  );
}
