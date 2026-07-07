"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../../components/layout/Header";
import { getHaClient } from "../../../../../lib/ha/client";
import adminStyles from "../../../../../components/admin/admin.module.css";

interface BackupInfo {
  slug: string;
  name: string;
  date: string;
  size: number;
}

/**
 * The core backup integration's WS schema has changed across HA versions
 * (pre- and post- "Backup 2.0" / multi-agent backups). This targets the
 * longer-standing backup/info + backup/generate + backup/remove commands;
 * on a newer install these calls surface a clear error rather than silently
 * no-oping, which is the right failure mode given this couldn't be verified
 * against a live instance.
 */
export default function BackupsPage() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const { data, isError } = useQuery({
    queryKey: ["backup_info"],
    queryFn: () => getHaClient().command<{ backups: BackupInfo[]; backing_up: boolean }>({ type: "backup/info" })
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["backup_info"] });
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      await getHaClient().command({ type: "backup/generate", name: name || undefined });
      setName("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm("Delete this backup?")) return;
    setBusy(true);
    try {
      await getHaClient().command({ type: "backup/remove", slug });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="System · Backups" showEdit={false} />

      {isError ? (
        <div className={adminStyles.card}>
          Couldn&apos;t load backups from this Home Assistant instance — the backup API may differ on your version. See the
          note in this page&apos;s source for details.
        </div>
      ) : (
        <>
          <div className={adminStyles.card} style={{ maxWidth: 480 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Create a backup</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input className={adminStyles.search} placeholder="Optional name" value={name} onChange={(e) => setName(e.target.value)} />
              <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={generate} disabled={busy || data?.backing_up}>
                {data?.backing_up ? "Backing up…" : "Create Backup"}
              </button>
            </div>
            {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div> : null}
          </div>

          <div className={adminStyles.tableWrap}>
            {!data?.backups || data.backups.length === 0 ? (
              <div className={adminStyles.empty}>No backups yet.</div>
            ) : (
              data.backups.map((b) => (
                <div key={b.slug} className={adminStyles.tableRow} style={{ cursor: "default" }}>
                  <span style={{ flex: 1 }}>{b.name}</span>
                  <span style={{ opacity: 0.5, fontSize: 12, marginRight: 14 }}>{new Date(b.date).toLocaleString()}</span>
                  <span style={{ opacity: 0.5, fontSize: 12, marginRight: 14 }}>{(b.size / 1024 / 1024).toFixed(1)} MB</span>
                  <a className={adminStyles.button} href={`/api/ha/rest/backup/download/${b.slug}`} style={{ textDecoration: "none" }}>
                    Download
                  </a>
                  <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} style={{ marginLeft: 8 }} onClick={() => remove(b.slug)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
