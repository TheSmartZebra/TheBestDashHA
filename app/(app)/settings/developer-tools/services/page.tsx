"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../../../../../components/layout/Header";
import { getHaClient } from "../../../../../lib/ha/client";
import type { HassServices } from "../../../../../lib/ha/types";
import adminStyles from "../../../../../components/admin/admin.module.css";

export default function DevToolsServicesPage() {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => getHaClient().command<HassServices>({ type: "get_services" })
  });

  const domains = useMemo(() => Object.keys(services ?? {}).sort(), [services]);
  const [domain, setDomain] = useState("");
  const [service, setService] = useState("");
  const [target, setTarget] = useState("");
  const [dataText, setDataText] = useState("{}");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [running, setRunning] = useState(false);

  const activeDomain = domain || domains[0] || "";
  const domainServices = services?.[activeDomain] ?? {};
  const serviceNames = useMemo(() => Object.keys(domainServices).sort(), [domainServices]);
  const activeService = service || serviceNames[0] || "";
  const meta = domainServices[activeService];

  async function run() {
    setResult(null);
    let data: Record<string, unknown>;
    try {
      data = dataText.trim() ? JSON.parse(dataText) : {};
    } catch {
      setResult({ ok: false, text: "Service data must be valid JSON." });
      return;
    }
    setRunning(true);
    try {
      const entityIds = target
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await getHaClient().callService(activeDomain, activeService, entityIds.length ? { entity_id: entityIds } : undefined, data);
      setResult({ ok: true, text: `${activeDomain}.${activeService} called successfully.` });
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Header title="Developer Tools · Services" showEdit={false} />
      <div className={adminStyles.card} style={{ maxWidth: 640 }}>
        <div className={adminStyles.label}>Domain</div>
        <select
          className={adminStyles.select}
          style={{ width: "100%" }}
          value={activeDomain}
          onChange={(e) => {
            setDomain(e.target.value);
            setService("");
          }}
        >
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className={adminStyles.label}>Service</div>
        <select className={adminStyles.select} style={{ width: "100%" }} value={activeService} onChange={(e) => setService(e.target.value)}>
          {serviceNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {meta?.description ? <div style={{ fontSize: 12.5, opacity: 0.55, marginTop: 6 }}>{meta.description}</div> : null}

        <div className={adminStyles.label}>Target entity_id(s) (comma-separated, optional)</div>
        <input className={adminStyles.search} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="light.living_room, light.kitchen" />

        <div className={adminStyles.label}>Service Data (JSON)</div>
        <textarea className={adminStyles.textarea} rows={8} value={dataText} onChange={(e) => setDataText(e.target.value)} />

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={run} disabled={running || !activeDomain || !activeService}>
            {running ? "Calling…" : "Call Service"}
          </button>
        </div>

        {result ? (
          <div style={{ marginTop: 14, fontSize: 13, color: result.ok ? "var(--kind-lock)" : "var(--danger)" }}>{result.text}</div>
        ) : null}
      </div>
    </>
  );
}
