import { Section, sectionStyles } from "./Section";
import { CameraTile } from "../tiles/CameraTile";
import { useAllStates } from "../../store/entities-store";
import type { TileEntry } from "../../lib/ha/dashboard";

export function CamerasRow({ cams }: { cams: TileEntry[] }) {
  const states = useAllStates();
  if (cams.length === 0) return null;
  const live = cams.filter((c) => ["recording", "streaming"].includes(states[c.entityId]!.state)).length;

  return (
    <Section title="Cameras" sub={`${live} live`}>
      <div className={sectionStyles.camGrid}>
        {cams.map((c) => (
          <CameraTile key={c.entityId} entityId={c.entityId} />
        ))}
      </div>
    </Section>
  );
}
