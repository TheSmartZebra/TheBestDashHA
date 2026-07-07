"use client";

import { useMemo, useState } from "react";
import { Header } from "../../../../components/layout/Header";
import { AdminTable, type Column } from "../../../../components/admin/AdminTable";
import { EntityEditorDrawer } from "../../../../components/admin/EntityEditorDrawer";
import { useRegistries } from "../../../../store/entities-store";
import type { EntityRegistryEntry } from "../../../../lib/ha/types";
import adminStyles from "../../../../components/admin/admin.module.css";

const columns: Column<EntityRegistryEntry>[] = [
  { key: "id", header: "Entity", width: "35%", render: (e) => <span className={adminStyles.mono}>{e.entity_id}</span> },
  { key: "name", header: "Name", width: "25%", render: (e) => e.name ?? "" },
  { key: "platform", header: "Integration", width: "20%", render: (e) => e.platform },
  {
    key: "status",
    header: "Status",
    width: "20%",
    render: (e) => (
      <>
        {e.disabled_by ? <span className={adminStyles.badge}>Disabled</span> : <span className={`${adminStyles.badge} ${adminStyles.badgeOn}`}>Enabled</span>}
        {e.hidden_by ? (
          <span className={adminStyles.badge} style={{ marginLeft: 6 }}>
            Hidden
          </span>
        ) : null}
      </>
    )
  }
];

export default function EntitiesRegistryPage() {
  const registries = useRegistries();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EntityRegistryEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = registries.entities;
    const filtered = q
      ? all.filter((e) => e.entity_id.toLowerCase().includes(q) || (e.name ?? "").toLowerCase().includes(q))
      : all;
    return filtered.slice().sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  }, [registries.entities, query, refreshKey]);

  return (
    <>
      <Header title="Entities" summary={`${registries.entities.length} registered`} showEdit={false} />
      <div className={adminStyles.toolbar}>
        <input className={adminStyles.search} placeholder="Filter entities…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <AdminTable rows={rows} columns={columns} rowKey={(e) => e.entity_id} onRowClick={setSelected} />
      {selected ? (
        <EntityEditorDrawer
          entry={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      ) : null}
    </>
  );
}
