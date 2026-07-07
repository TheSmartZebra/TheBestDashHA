"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { useAllStates } from "../../../../store/entities-store";
import adminStyles from "../../../../components/admin/admin.module.css";

interface HistoryPoint {
  entity_id: string;
  state: string;
  last_changed: string;
}

interface LogbookEntry {
  when: string;
  name?: string;
  message?: string;
  entity_id?: string;
  domain?: string;
}

export default function HistoryPage() {
  const states = useAllStates();
  const [entityId, setEntityId] = useState("");
  const [hours, setHours] = useState(24);

  const start = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  const { data: history, isFetching: loadingHistory } = useQuery({
    queryKey: ["history", entityId, hours],
    enabled: !!entityId,
    queryFn: async () => {
      const res = await fetch(`/api/ha/rest/history/period/${start}?filter_entity_id=${entityId}&minimal_response=true`);
      const data = await res.json();
      return (data?.[0] ?? []) as HistoryPoint[];
    }
  });

  const { data: logbook, isFetching: loadingLogbook } = useQuery({
    queryKey: ["logbook", entityId, hours],
    enabled: !!entityId,
    queryFn: async () => {
      const res = await fetch(`/api/ha/rest/logbook/${start}?entity=${entityId}`);
      return (await res.json()) as LogbookEntry[];
    }
  });

  return (
    <>
      <Header title="Activity History" showEdit={false} />
      <div className={adminStyles.toolbar}>
        <input
          className={adminStyles.search}
          list="entity-options"
          placeholder="Pick an entity_id…"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
        <datalist id="entity-options">
          {Object.keys(states).map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>
        <select className={adminStyles.select} value={hours} onChange={(e) => setHours(Number(e.target.value))}>
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={72}>Last 3 days</option>
          <option value={168}>Last 7 days</option>
        </select>
      </div>

      {!entityId ? (
        <div className={adminStyles.tableWrap}>
          <div className={adminStyles.empty}>Pick an entity to see its history and logbook.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div className={adminStyles.label} style={{ marginTop: 0 }}>
              State History
            </div>
            <div className={adminStyles.tableWrap}>
              <div className={adminStyles.tableScroll} style={{ height: 440 }}>
                {loadingHistory ? (
                  <div className={adminStyles.empty}>Loading…</div>
                ) : !history || history.length === 0 ? (
                  <div className={adminStyles.empty}>No history in range.</div>
                ) : (
                  history
                    .slice()
                    .reverse()
                    .map((h, i) => (
                      <div key={i} className={adminStyles.tableRow} style={{ cursor: "default" }}>
                        <span className={adminStyles.tableCell} style={{ width: "55%" }}>
                          {new Date(h.last_changed).toLocaleString()}
                        </span>
                        <span className={adminStyles.tableCell} style={{ width: "45%", fontWeight: 600 }}>
                          {h.state}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className={adminStyles.label} style={{ marginTop: 0 }}>
              Logbook
            </div>
            <div className={adminStyles.tableWrap}>
              <div className={adminStyles.tableScroll} style={{ height: 440 }}>
                {loadingLogbook ? (
                  <div className={adminStyles.empty}>Loading…</div>
                ) : !logbook || logbook.length === 0 ? (
                  <div className={adminStyles.empty}>No logbook entries in range.</div>
                ) : (
                  logbook
                    .slice()
                    .reverse()
                    .map((entry, i) => (
                      <div key={i} className={adminStyles.tableRow} style={{ cursor: "default", flexDirection: "column", alignItems: "flex-start", padding: "8px 16px" }}>
                        <span style={{ fontSize: 11.5, opacity: 0.5 }}>{new Date(entry.when).toLocaleString()}</span>
                        <span>
                          {entry.name} {entry.message}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
