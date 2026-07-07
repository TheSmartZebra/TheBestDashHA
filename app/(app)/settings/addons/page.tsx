"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { getHaClient } from "../../../../lib/ha/client";
import adminStyles from "../../../../components/admin/admin.module.css";

interface Addon {
  slug: string;
  name: string;
  description: string;
  version: string;
  version_latest: string;
  state: "started" | "stopped";
  update_available: boolean;
  icon: boolean;
}

interface SupervisorResponse<T> {
  result: "ok" | "error";
  data: T;
}

async function supervisorGet<T>(endpoint: string): Promise<T> {
  const res = await getHaClient().command<SupervisorResponse<T>>({ type: "supervisor/api", endpoint, method: "get" });
  return res.data;
}

async function supervisorPost(endpoint: string) {
  await getHaClient().command({ type: "supervisor/api", endpoint, method: "post", timeout: 60 });
}

export default function AddonsPage() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isError, isLoading } = useQuery({
    queryKey: ["addons"],
    retry: false,
    queryFn: () => supervisorGet<{ addons: Addon[] }>("/addons")
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["addons"] });
  }

  async function action(slug: string, act: "start" | "stop" | "restart") {
    setBusy(slug);
    setError(null);
    try {
      await supervisorPost(`/addons/${slug}/${act}`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Add-ons" showEdit={false} />
        <div className={adminStyles.empty}>Loading…</div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title="Add-ons" showEdit={false} />
        <div className={adminStyles.card}>
          Add-ons require Home Assistant OS or Supervised with the Supervisor installed. This instance doesn&apos;t
          expose the Supervisor API, so this section is unavailable here — this matches how the stock frontend also
          hides Add-ons on Core-only installs.
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Add-ons" summary={`${data?.addons.length ?? 0} installed`} showEdit={false} />
      {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>{error}</div> : null}
      <div className={adminStyles.tableWrap}>
        {!data?.addons.length ? (
          <div className={adminStyles.empty}>No add-ons installed.</div>
        ) : (
          data.addons.map((a) => (
            <div key={a.slug} className={adminStyles.tableRow} style={{ cursor: "default", height: "auto", padding: "12px 16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 12, opacity: 0.55 }}>
                  v{a.version}
                  {a.update_available ? ` (update to ${a.version_latest} available)` : ""}
                </div>
              </div>
              <span className={`${adminStyles.badge} ${a.state === "started" ? adminStyles.badgeOn : ""}`}>{a.state}</span>
              <button className={adminStyles.button} style={{ marginLeft: 10 }} disabled={busy === a.slug} onClick={() => action(a.slug, a.state === "started" ? "stop" : "start")}>
                {a.state === "started" ? "Stop" : "Start"}
              </button>
              <button className={adminStyles.button} style={{ marginLeft: 8 }} disabled={busy === a.slug} onClick={() => action(a.slug, "restart")}>
                Restart
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
