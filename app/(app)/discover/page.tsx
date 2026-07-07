"use client";

import { Header } from "../../../components/layout/Header";
import { DiscoverList } from "../../../components/dashboard/DiscoverList";

export default function DiscoverPage() {
  return (
    <>
      <Header title="Discover" showEdit={false} />
      <DiscoverList />
    </>
  );
}
