"use client";

import { useEffect, useRef, useState } from "react";
import { configFlow, type FlowStep } from "../../lib/ha/config-flow";
import { SchemaForm } from "./SchemaForm";
import adminStyles from "../admin/admin.module.css";
import styles from "./FlowRunner.module.css";

export function FlowRunner({
  start,
  onClose,
  onDone
}: {
  start: () => Promise<FlowStep>;
  onClose: () => void;
  onDone: (result?: { entry_id: string; title: string }) => void;
}) {
  const [step, setStep] = useState<FlowStep | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flowIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start()
      .then((s) => {
        flowIdRef.current = s.flow_id;
        setStep(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [start]);

  useEffect(() => {
    if (step?.type !== "progress" || !flowIdRef.current) return;
    const flowId = flowIdRef.current;
    const timer = setTimeout(() => {
      configFlow
        .step(flowId, {})
        .then(setStep)
        .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }, 1500);
    return () => clearTimeout(timer);
  }, [step]);

  async function submit(data: Record<string, unknown>) {
    if (!flowIdRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const next = await configFlow.step(flowIdRef.current, data);
      setStep(next);
      setValues({});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (flowIdRef.current && step && !["create_entry", "abort"].includes(step.type)) {
      configFlow.abort(flowIdRef.current).catch(() => {});
    }
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {!step ? (
          <div className={adminStyles.empty}>{error ?? "Starting…"}</div>
        ) : step.type === "form" ? (
          <>
            <div className={styles.title}>{step.step_id}</div>
            {step.description_placeholders ? (
              <div className={styles.desc}>{JSON.stringify(step.description_placeholders)}</div>
            ) : null}
            <SchemaForm
              schema={step.data_schema ?? []}
              values={values}
              onChange={(name, v) => setValues((old) => ({ ...old, [name]: v }))}
              errors={step.errors}
            />
            {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div> : null}
            <div className={styles.actions}>
              <button className={adminStyles.button} onClick={close}>
                Cancel
              </button>
              <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={() => submit(values)} disabled={busy}>
                {busy ? "Submitting…" : step.last_step ? "Finish" : "Next"}
              </button>
            </div>
          </>
        ) : step.type === "menu" ? (
          <>
            <div className={styles.title}>{step.step_id}</div>
            {(Array.isArray(step.menu_options) ? step.menu_options : Object.keys(step.menu_options ?? {})).map((opt) => (
              <button key={opt} className={styles.menuBtn} onClick={() => submit({ next_step_id: opt })}>
                {!Array.isArray(step.menu_options) ? step.menu_options![opt] : opt}
              </button>
            ))}
            <div className={styles.actions}>
              <button className={adminStyles.button} onClick={close}>
                Cancel
              </button>
            </div>
          </>
        ) : step.type === "progress" ? (
          <div className={adminStyles.empty}>{step.progress_action ?? "Working…"}</div>
        ) : step.type === "create_entry" ? (
          <>
            <div className={styles.title}>Success</div>
            <div className={styles.desc}>&quot;{step.title}&quot; has been set up.</div>
            <div className={styles.actions}>
              <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={() => onDone(step.result)}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.title}>Could not complete setup</div>
            <div className={styles.desc}>{step.reason ?? "The flow was aborted."}</div>
            <div className={styles.actions}>
              <button className={adminStyles.button} onClick={close}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
