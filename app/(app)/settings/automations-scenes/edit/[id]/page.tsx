"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "../../../../../../components/layout/Header";
import { configEditor } from "../../../../../../lib/ha/config-editor";
import adminStyles from "../../../../../../components/admin/admin.module.css";

const DEFAULTS: Record<string, Record<string, unknown>> = {
  automation: { alias: "New Automation", trigger: [], condition: [], action: [], mode: "single" },
  scene: { name: "New Scene", entities: {} }
};

function Editor({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = (searchParams.get("domain") as "automation" | "scene") ?? "automation";

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    configEditor
      .get(domain, id)
      .then((config) => setText(JSON.stringify(config, null, 2)))
      .catch(() => {
        setIsNew(true);
        setText(JSON.stringify(DEFAULTS[domain], null, 2));
      })
      .finally(() => setLoading(false));
  }, [domain, id]);

  async function save() {
    setError(null);
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(text);
    } catch {
      setError("Configuration must be valid JSON.");
      return;
    }
    setSaving(true);
    try {
      await configEditor.save(domain, id, config);
      router.push("/settings/automations-scenes");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this configuration?")) return;
    setSaving(true);
    try {
      await configEditor.remove(domain, id);
      router.push("/settings/automations-scenes");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title={isNew ? `New ${domain}` : `Edit ${domain}`} summary={id} showEdit={false} />
      {loading ? (
        <div className={adminStyles.empty}>Loading…</div>
      ) : (
        <div className={adminStyles.card} style={{ maxWidth: 720 }}>
          <div className={adminStyles.label} style={{ marginTop: 0 }}>
            Configuration (JSON)
          </div>
          <textarea className={adminStyles.textarea} rows={22} value={text} onChange={(e) => setText(e.target.value)} />
          {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className={adminStyles.button} onClick={() => router.push("/settings/automations-scenes")}>
              Cancel
            </button>
            <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            {!isNew ? (
              <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} onClick={remove} disabled={saving} style={{ marginLeft: "auto" }}>
                Delete
              </button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

export default function EditAutomationScenePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className={adminStyles.empty}>Loading…</div>}>
      <Editor id={id} />
    </Suspense>
  );
}
