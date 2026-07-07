"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { AddIntegrationPicker } from "../../../../components/config-flow/AddIntegrationPicker";
import { getHaClient } from "../../../../lib/ha/client";
import type { ConfigEntry } from "../../../../lib/ha/types";
import adminStyles from "../../../../components/admin/admin.module.css";

export default function DevicesServicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: entries } = useQuery({
    queryKey: ["config_entries"],
    queryFn: () => getHaClient().command<ConfigEntry[]>({ type: "config_entries/get" })
  });

  const byDomain = useMemo(() => {
    const groups = new Map<string, ConfigEntry[]>();
    for (const e of entries ?? []) {
      if (!groups.has(e.domain)) groups.set(e.domain, []);
      groups.get(e.domain)!.push(e);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [entries]);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["config_entries"] });
  }

  return (
    <>
      <Header title="Devices & Services" summary={entries ? `${entries.length} integrations` : undefined} showEdit={false} />
      <div className={adminStyles.toolbar}>
        <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={() => setAdding(true)}>
          + Add Integration
        </button>
      </div>

      {byDomain.length === 0 ? (
        <div className={adminStyles.tableWrap}>
          <div className={adminStyles.empty}>No integrations configured yet.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {byDomain.map(([domain, domainEntries]) => (
            <div key={domain} className={adminStyles.card} style={{ marginBottom: 0 }}>
              <img
                src={`https://brands.home-assistant.io/${domain}/icon.png`}
                alt=""
                width={28}
                height={28}
                style={{ borderRadius: 6, marginBottom: 8 }}
                onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
              />
              <div style={{ fontWeight: 700, fontSize: 14 }}>{domain}</div>
              {domainEntries.map((entry) => (
                <div
                  key={entry.entry_id}
                  className={adminStyles.row}
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push(`/settings/devices-services/${entry.entry_id}`)}
                >
                  <span style={{ fontSize: 12.5 }}>{entry.title}</span>
                  <span className={`${adminStyles.badge} ${entry.state === "loaded" ? adminStyles.badgeOn : adminStyles.badgeWarn}`}>
                    {entry.state}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <AddIntegrationPicker
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false);
            refresh();
          }}
        />
      ) : null}
    </>
  );
}
