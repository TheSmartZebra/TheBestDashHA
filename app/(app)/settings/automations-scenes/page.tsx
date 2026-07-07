"use client";

import { useRouter } from "next/navigation";
import { Header } from "../../../../components/layout/Header";
import { useAutomations, useScenes } from "../../../../hooks/useDashboard";
import { getHaClient } from "../../../../lib/ha/client";
import { newConfigId } from "../../../../lib/ha/config-editor";
import adminStyles from "../../../../components/admin/admin.module.css";

export default function AutomationsScenesPage() {
  const automations = useAutomations();
  const scenesAndScripts = useScenes();
  const router = useRouter();

  return (
    <>
      <Header title="Automations & Scenes" showEdit={false} />

      <div className={adminStyles.toolbar}>
        <button
          className={`${adminStyles.button} ${adminStyles.buttonPrimary}`}
          onClick={() => router.push(`/settings/automations-scenes/edit/${newConfigId()}?domain=automation`)}
        >
          + New Automation
        </button>
      </div>

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        Automations
      </div>
      <div className={adminStyles.tableWrap} style={{ marginBottom: 24 }}>
        {automations.length === 0 ? (
          <div className={adminStyles.empty}>No automations yet.</div>
        ) : (
          automations.map((a) => (
            <div key={a.entityId} className={adminStyles.tableRow} onClick={() => a.configId && router.push(`/settings/automations-scenes/edit/${a.configId}?domain=automation`)}>
              <span style={{ flex: 1 }}>{a.name}</span>
              <span className={`${adminStyles.badge} ${a.on ? adminStyles.badgeOn : ""}`}>{a.on ? "Enabled" : "Disabled"}</span>
              <button
                className={adminStyles.button}
                style={{ marginLeft: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  getHaClient()
                    .callService("automation", "trigger", { entity_id: a.entityId })
                    .catch((err) => console.error("[run automation]", err));
                }}
              >
                Run Now
              </button>
            </div>
          ))
        )}
      </div>

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        Scenes & Scripts
      </div>
      <div className={adminStyles.tableWrap}>
        {scenesAndScripts.length === 0 ? (
          <div className={adminStyles.empty}>No scenes or scripts yet.</div>
        ) : (
          scenesAndScripts.map((s) => (
            <div
              key={s.entityId}
              className={adminStyles.tableRow}
              onClick={() => s.configId && s.domain === "scene" && router.push(`/settings/automations-scenes/edit/${s.configId}?domain=scene`)}
            >
              <span style={{ flex: 1 }}>{s.name}</span>
              <span style={{ opacity: 0.4, fontSize: 12 }}>{s.domain}</span>
              <button
                className={adminStyles.button}
                style={{ marginLeft: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  getHaClient()
                    .callService(s.domain, "turn_on", { entity_id: s.entityId })
                    .catch((err) => console.error("[activate]", err));
                }}
              >
                Activate
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
