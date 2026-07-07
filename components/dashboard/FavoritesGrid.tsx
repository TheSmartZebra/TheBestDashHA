"use client";

import { Section, sectionStyles } from "./Section";
import { Tile } from "../tiles/Tile";
import { useAppSettings } from "../providers/AppSettingsProvider";
import { useUiStore } from "../../store/ui-store";
import { useAllStates } from "../../store/entities-store";

export function FavoritesGrid() {
  const { settings } = useAppSettings();
  const edit = useUiStore((s) => s.edit);
  const states = useAllStates();

  const pinned = settings.pinned.filter((id) => states[id]);
  if (pinned.length === 0 && !edit) return null;

  return (
    <Section title="Favorites">
      <div className={sectionStyles.favGrid}>
        {pinned.map((id) => (
          <Tile key={id} entityId={id} variant="favorite" />
        ))}
        {pinned.length === 0 ? (
          <div style={{ opacity: 0.5, fontSize: 13.5, gridColumn: "1 / -1" }}>
            No favorites yet — tap any accessory below to pin it.
          </div>
        ) : null}
      </div>
    </Section>
  );
}
