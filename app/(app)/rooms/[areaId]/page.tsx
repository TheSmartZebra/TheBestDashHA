"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Header } from "../../../../components/layout/Header";
import { CamerasRow } from "../../../../components/dashboard/CamerasRow";
import { Section, sectionStyles } from "../../../../components/dashboard/Section";
import { Tile } from "../../../../components/tiles/Tile";
import { useAreaList, useCameras, useRoomSections } from "../../../../hooks/useDashboard";

export default function RoomPage({ params }: { params: Promise<{ areaId: string }> }) {
  const { areaId } = use(params);
  const areas = useAreaList();
  const area = areas.find((a) => a.area_id === areaId);

  const cams = useCameras({ areaLabel: area?.name });
  const sections = useRoomSections({ areaLabel: area?.name });

  if (areas.length > 0 && !area) notFound();
  if (!area) return null;

  const entries = sections[0]?.entries ?? [];

  return (
    <>
      <Header title={area.name} showEdit={false} />
      <CamerasRow cams={cams} />
      {entries.length > 0 ? (
        <Section title="Accessories">
          <div className={sectionStyles.rowGrid}>
            {entries.map((e) => (
              <Tile key={e.entityId} entityId={e.entityId} variant="row" />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
