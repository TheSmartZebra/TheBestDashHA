"use client";

import { Header } from "../../components/layout/Header";
import { StatCardsRow } from "../../components/dashboard/StatCardsRow";
import { ScenesRow } from "../../components/dashboard/ScenesRow";
import { FavoritesGrid } from "../../components/dashboard/FavoritesGrid";
import { CamerasRow } from "../../components/dashboard/CamerasRow";
import { RoomSections } from "../../components/dashboard/RoomSections";
import { useCameras, useRoomSections, useSummary } from "../../hooks/useDashboard";

export default function HomePage() {
  const summary = useSummary();
  const sections = useRoomSections();
  const cams = useCameras();

  return (
    <>
      <Header title="My Home" summary={summary} />
      <StatCardsRow />
      <ScenesRow />
      <FavoritesGrid />
      <CamerasRow cams={cams} />
      <RoomSections sections={sections} />
    </>
  );
}
