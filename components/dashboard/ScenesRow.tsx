"use client";

import { Section, sectionStyles } from "./Section";
import { ScenePill } from "../ds/ScenePill";
import { Icon } from "../ds/Icon";
import { useScenes } from "../../hooks/useDashboard";
import { useAppSettings } from "../providers/AppSettingsProvider";
import { getHaClient } from "../../lib/ha/client";
import { domainOf } from "../../lib/ha/entity-model";

export function ScenesRow() {
  const scenes = useScenes();
  const { settings } = useAppSettings();

  if (!settings.showScenes || scenes.length === 0) return null;

  return (
    <Section title="Scenes">
      <div className={sectionStyles.scenesRow}>
        {scenes.map((s) => (
          <ScenePill
            key={s.entityId}
            icon={<Icon kind={s.icon} color="#fff" size={15} />}
            iconBg="var(--accent)"
            label={s.name}
            onClick={() =>
              getHaClient()
                .callService(domainOf(s.entityId), "turn_on", { entity_id: s.entityId })
                .catch((err) => console.error("[activate scene]", err))
            }
          />
        ))}
      </div>
    </Section>
  );
}
