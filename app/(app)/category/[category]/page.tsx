"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Header } from "../../../../components/layout/Header";
import { CamerasRow } from "../../../../components/dashboard/CamerasRow";
import { RoomSections } from "../../../../components/dashboard/RoomSections";
import { useCameras, useRoomSections } from "../../../../hooks/useDashboard";
import { CATEGORY_LABEL, type Category } from "../../../../lib/ha/entity-model";

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABEL));

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  if (!VALID_CATEGORIES.has(category)) notFound();
  const cat = category as NonNullable<Category>;

  const cams = useCameras();
  const sections = useRoomSections({ category: cat });

  return (
    <>
      <Header title={CATEGORY_LABEL[cat]} showEdit={false} />
      {cat === "cameras" ? <CamerasRow cams={cams} /> : <RoomSections sections={sections} />}
    </>
  );
}
