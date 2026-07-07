"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../../../../../components/layout/Header";
import { getHaClient } from "../../../../../lib/ha/client";
import adminStyles from "../../../../../components/admin/admin.module.css";

interface StatisticId {
  statistic_id: string;
  display_unit_of_measurement?: string;
  name?: string | null;
  source: string;
}

interface StatPeriod {
  start: number;
  end: number;
  mean?: number | null;
  min?: number | null;
  max?: number | null;
  sum?: number | null;
  state?: number | null;
}

export default function DevToolsStatisticsPage() {
  const { data: statisticIds } = useQuery({
    queryKey: ["statistic_ids"],
    queryFn: () => getHaClient().command<StatisticId[]>({ type: "recorder/list_statistic_ids" })
  });

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = statisticIds ?? [];
    return q ? all.filter((s) => s.statistic_id.toLowerCase().includes(q)) : all;
  }, [statisticIds, query]);

  const { data: periods, isFetching } = useQuery({
    queryKey: ["statistics_during_period", selected],
    enabled: !!selected,
    queryFn: async () => {
      const start = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const result = await getHaClient().command<Record<string, StatPeriod[]>>({
        type: "recorder/statistics_during_period",
        start_time: start,
        statistic_ids: [selected],
        period: "day",
        types: ["mean", "min", "max", "sum", "state"]
      });
      return result[selected!] ?? [];
    }
  });

  return (
    <>
      <Header title="Developer Tools · Statistics" showEdit={false} />
      <div className={adminStyles.toolbar}>
        <input className={adminStyles.search} placeholder="Filter statistic IDs…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <div className={adminStyles.tableWrap}>
          <div className={adminStyles.tableScroll} style={{ height: 480 }}>
            {filtered.length === 0 ? (
              <div className={adminStyles.empty}>No statistics found.</div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.statistic_id}
                  className={adminStyles.tableRow}
                  style={{ background: selected === s.statistic_id ? "rgba(255,255,255,.08)" : undefined }}
                  onClick={() => setSelected(s.statistic_id)}
                >
                  <span className={adminStyles.mono} style={{ fontSize: 12 }}>
                    {s.statistic_id}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={adminStyles.tableWrap} style={{ padding: 14 }}>
          {!selected ? (
            <div className={adminStyles.empty}>Select a statistic to view the last 7 days.</div>
          ) : isFetching ? (
            <div className={adminStyles.empty}>Loading…</div>
          ) : !periods || periods.length === 0 ? (
            <div className={adminStyles.empty}>No data recorded for this period.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ opacity: 0.5, textAlign: "left" }}>
                  <th style={{ padding: "4px 8px" }}>Day</th>
                  <th style={{ padding: "4px 8px" }}>Mean</th>
                  <th style={{ padding: "4px 8px" }}>Min</th>
                  <th style={{ padding: "4px 8px" }}>Max</th>
                  <th style={{ padding: "4px 8px" }}>Sum</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.start} style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                    <td style={{ padding: "6px 8px" }}>{new Date(p.start).toLocaleDateString()}</td>
                    <td style={{ padding: "6px 8px" }}>{p.mean?.toFixed(2) ?? "—"}</td>
                    <td style={{ padding: "6px 8px" }}>{p.min?.toFixed(2) ?? "—"}</td>
                    <td style={{ padding: "6px 8px" }}>{p.max?.toFixed(2) ?? "—"}</td>
                    <td style={{ padding: "6px 8px" }}>{p.sum?.toFixed(2) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
