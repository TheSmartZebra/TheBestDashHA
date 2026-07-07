"use client";

import { useMemo, useState } from "react";
import { Header } from "../../../../../components/layout/Header";
import { AdminTable, type Column } from "../../../../../components/admin/AdminTable";
import { StateEditorDrawer } from "../../../../../components/admin/StateEditorDrawer";
import { useAllStates } from "../../../../../store/entities-store";
import type { HassEntity } from "../../../../../lib/ha/types";
import adminStyles from "../../../../../components/admin/admin.module.css";

const columns: Column<HassEntity>[] = [
  { key: "id", header: "Entity", width: "38%", render: (e) => <span className={adminStyles.mono}>{e.entity_id}</span> },
  { key: "state", header: "State", width: "18%", render: (e) => e.state },
  {
    key: "name",
    header: "Friendly Name",
    width: "24%",
    render: (e) => (e.attributes.friendly_name as string | undefined) ?? ""
  },
  { key: "updated", header: "Last Changed", width: "20%", render: (e) => new Date(e.last_changed).toLocaleString() }
];

export default function DevToolsStatesPage() {
  const states = useAllStates();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HassEntity | null>(null);

  const rows = useMemo(() => {
    const all = Object.values(states);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? all.filter(
          (e) =>
            e.entity_id.toLowerCase().includes(q) ||
            e.state.toLowerCase().includes(q) ||
            ((e.attributes.friendly_name as string | undefined) ?? "").toLowerCase().includes(q)
        )
      : all;
    return filtered.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  }, [states, query]);

  return (
    <>
      <Header title="Developer Tools · States" summary={`${rows.length} of ${Object.keys(states).length} entities`} showEdit={false} />
      <div className={adminStyles.toolbar}>
        <input
          className={adminStyles.search}
          placeholder="Filter by entity, state, or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <AdminTable rows={rows} columns={columns} rowKey={(e) => e.entity_id} onRowClick={setSelected} />
      {selected ? <StateEditorDrawer entity={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
