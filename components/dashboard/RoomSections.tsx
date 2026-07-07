import { Section, sectionStyles } from "./Section";
import { Tile } from "../tiles/Tile";
import { useAllStates } from "../../store/entities-store";
import { isOn } from "../../lib/ha/entity-model";
import type { TileEntry } from "../../lib/ha/dashboard";

export function RoomSections({ sections }: { sections: { areaLabel: string; entries: TileEntry[] }[] }) {
  const states = useAllStates();

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ areaLabel, entries }) => {
        const onCount = entries.filter((e) => e.kind !== "sensor" && e.kind !== "binary_sensor" && isOn(states[e.entityId]!)).length;
        return (
          <Section key={areaLabel} title={areaLabel} sub={onCount ? `${onCount} on` : ""}>
            <div className={sectionStyles.rowGrid}>
              {entries.map((e) => (
                <Tile key={e.entityId} entityId={e.entityId} variant="row" />
              ))}
            </div>
          </Section>
        );
      })}
    </>
  );
}
