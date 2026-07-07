"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "../../../../../components/layout/Header";
import { getHaClient } from "../../../../../lib/ha/client";
import adminStyles from "../../../../../components/admin/admin.module.css";

interface LogEntry {
  at: string;
  event: unknown;
}

export default function DevToolsEventsPage() {
  const [listenType, setListenType] = useState("state_changed");
  const [listening, setListening] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  const [fireType, setFireType] = useState("");
  const [fireData, setFireData] = useState("{}");
  const [fireResult, setFireResult] = useState<string | null>(null);
  const [listenError, setListenError] = useState<string | null>(null);

  useEffect(() => () => unsubRef.current?.(), []);

  async function toggleListen() {
    if (listening) {
      unsubRef.current?.();
      unsubRef.current = null;
      setListening(false);
      return;
    }
    setLog([]);
    setListenError(null);
    try {
      const unsub = await getHaClient().subscribeEvents(listenType || undefined, (event) => {
        setLog((l) => [{ at: new Date().toLocaleTimeString(), event }, ...l].slice(0, 200));
      });
      unsubRef.current = unsub;
      setListening(true);
    } catch (err) {
      setListenError(err instanceof Error ? err.message : String(err));
    }
  }

  async function fire() {
    setFireResult(null);
    let data: Record<string, unknown>;
    try {
      data = fireData.trim() ? JSON.parse(fireData) : {};
    } catch {
      setFireResult("Event data must be valid JSON.");
      return;
    }
    try {
      await getHaClient().command({ type: "fire_event", event_type: fireType, event_data: data });
      setFireResult(`Fired "${fireType}".`);
    } catch (err) {
      setFireResult(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Header title="Developer Tools · Events" showEdit={false} />

      <div className={adminStyles.card} style={{ maxWidth: 640 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Listen to events</div>
        <div className={adminStyles.label}>Event type (blank = all)</div>
        <input className={adminStyles.search} value={listenType} onChange={(e) => setListenType(e.target.value)} placeholder="state_changed" />
        <div style={{ marginTop: 14 }}>
          <button className={`${adminStyles.button} ${listening ? adminStyles.buttonDanger : adminStyles.buttonPrimary}`} onClick={toggleListen}>
            {listening ? "Stop Listening" : "Start Listening"}
          </button>
        </div>
        {listenError ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{listenError}</div> : null}
      </div>

      <div className={adminStyles.tableWrap} style={{ marginBottom: 20 }}>
        <div className={adminStyles.tableScroll} style={{ height: 320, padding: 12 }}>
          {log.length === 0 ? (
            <div className={adminStyles.empty}>{listening ? "Waiting for events…" : "Not listening."}</div>
          ) : (
            log.map((entry, i) => (
              <pre key={i} className={adminStyles.mono} style={{ margin: "0 0 10px", whiteSpace: "pre-wrap", fontSize: 11.5, opacity: 0.85 }}>
                [{entry.at}] {JSON.stringify(entry.event, null, 2)}
              </pre>
            ))
          )}
        </div>
      </div>

      <div className={adminStyles.card} style={{ maxWidth: 640 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Fire an event</div>
        <div className={adminStyles.label}>Event type</div>
        <input className={adminStyles.search} value={fireType} onChange={(e) => setFireType(e.target.value)} placeholder="my_custom_event" />
        <div className={adminStyles.label}>Event data (JSON)</div>
        <textarea className={adminStyles.textarea} rows={6} value={fireData} onChange={(e) => setFireData(e.target.value)} />
        <div style={{ marginTop: 14 }}>
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={fire} disabled={!fireType}>
            Fire Event
          </button>
        </div>
        {fireResult ? <div style={{ marginTop: 10, fontSize: 13 }}>{fireResult}</div> : null}
      </div>
    </>
  );
}
