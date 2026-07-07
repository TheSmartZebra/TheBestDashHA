"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../../components/layout/Header";
import { FlowRunner } from "../../../../../components/config-flow/FlowRunner";
import { getHaClient } from "../../../../../lib/ha/client";
import { haRest } from "../../../../../lib/ha/rest";
import { configFlow } from "../../../../../lib/ha/config-flow";
import { useRegistries } from "../../../../../store/entities-store";
import type { ConfigEntry } from "../../../../../lib/ha/types";
import adminStyles from "../../../../../components/admin/admin.module.css";

export default function ConfigEntryDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const registries = useRegistries();
  const [showOptions, setShowOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: entries } = useQuery({
    queryKey: ["config_entries"],
    queryFn: () => getHaClient().command<ConfigEntry[]>({ type: "config_entries/get" })
  });
  const entry = entries?.find((e) => e.entry_id === entryId);

  const devices = registries.devices.filter((d) => d.config_entries?.includes(entryId));
  const deviceIds = new Set(devices.map((d) => d.id));
  const entities = registries.entities.filter((e) => e.config_entry_id === entryId || (e.device_id && deviceIds.has(e.device_id)));

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["config_entries"] });
  }

  async function reload() {
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({ type: "config_entries/reload", entry_id: entryId });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleDisabled() {
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({
        type: "config_entries/disable",
        entry_id: entryId,
        disabled_by: entry?.disabled_by ? null : "user"
      });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove "${entry?.title}"? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      await haRest.del(`config/config_entries/entry/${entryId}`);
      router.push("/settings/devices-services");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!entry) {
    return (
      <>
        <Header title="Integration" showEdit={false} />
        <div className={adminStyles.empty}>Loading…</div>
      </>
    );
  }

  return (
    <>
      <Header title={entry.title} summary={`${entry.domain} · ${entry.state}`} showEdit={false} />

      <div className={adminStyles.toolbar}>
        {entry.supports_options ? (
          <button className={adminStyles.button} onClick={() => setShowOptions(true)}>
            Configure
          </button>
        ) : null}
        <button className={adminStyles.button} onClick={reload} disabled={busy}>
          Reload
        </button>
        <button className={adminStyles.button} onClick={toggleDisabled} disabled={busy}>
          {entry.disabled_by ? "Enable" : "Disable"}
        </button>
        {entry.supports_remove ? (
          <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} onClick={remove} disabled={busy}>
            Delete
          </button>
        ) : null}
      </div>
      {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>{error}</div> : null}

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        Devices ({devices.length})
      </div>
      <div className={adminStyles.tableWrap} style={{ marginBottom: 20 }}>
        {devices.length === 0 ? (
          <div className={adminStyles.empty}>No devices.</div>
        ) : (
          devices.map((d) => (
            <div key={d.id} className={adminStyles.tableRow} style={{ cursor: "default" }}>
              <span style={{ flex: 1 }}>{d.name_by_user ?? d.name ?? d.id}</span>
              <span style={{ opacity: 0.5, fontSize: 12 }}>{d.manufacturer}</span>
            </div>
          ))
        )}
      </div>

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        Entities ({entities.length})
      </div>
      <div className={adminStyles.tableWrap}>
        {entities.length === 0 ? (
          <div className={adminStyles.empty}>No entities.</div>
        ) : (
          entities.map((e) => (
            <div key={e.entity_id} className={adminStyles.tableRow} style={{ cursor: "default" }}>
              <span className={adminStyles.mono} style={{ fontSize: 12 }}>
                {e.entity_id}
              </span>
            </div>
          ))
        )}
      </div>

      {showOptions ? (
        <FlowRunner
          start={() => configFlow.startOptions(entryId)}
          onClose={() => setShowOptions(false)}
          onDone={() => {
            setShowOptions(false);
            refresh();
          }}
        />
      ) : null}
    </>
  );
}
