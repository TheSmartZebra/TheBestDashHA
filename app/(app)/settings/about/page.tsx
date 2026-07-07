"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { getHaClient } from "../../../../lib/ha/client";
import { useAllStates, useRegistries } from "../../../../store/entities-store";
import adminStyles from "../../../../components/admin/admin.module.css";

interface HassConfigLike {
  version: string;
  location_name: string;
  time_zone: string;
  latitude: number;
  longitude: number;
  unit_system: { length?: string; mass?: string; temperature?: string; volume?: string };
  components: string[];
}

export default function AboutPage() {
  const { data: config } = useQuery({
    queryKey: ["get_config"],
    queryFn: () => getHaClient().command<HassConfigLike>({ type: "get_config" })
  });
  const states = useAllStates();
  const registries = useRegistries();

  const rows: [string, string][] = config
    ? [
        ["Home Assistant Core", config.version],
        ["Home", config.location_name],
        ["Time Zone", config.time_zone],
        ["Coordinates", `${config.latitude}, ${config.longitude}`],
        ["Temperature Unit", config.unit_system?.temperature ?? "—"],
        ["Loaded Components", String(config.components?.length ?? 0)],
        ["Entities", String(Object.keys(states).length)],
        ["Devices", String(registries.devices.length)],
        ["Areas", String(registries.areas.length)]
      ]
    : [];

  return (
    <>
      <Header title="About Home Assistant" showEdit={false} />
      <div className={adminStyles.card} style={{ maxWidth: 520 }}>
        {rows.length === 0 ? (
          <div className={adminStyles.empty}>Loading…</div>
        ) : (
          rows.map(([label, value]) => (
            <div key={label} className={adminStyles.row}>
              <span style={{ opacity: 0.6, fontSize: 13 }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
            </div>
          ))
        )}
      </div>
      <div className={adminStyles.card} style={{ maxWidth: 520, fontSize: 12.5, opacity: 0.6, lineHeight: 1.6 }}>
        This dashboard is a standalone frontend for Home Assistant — an Apple Home-inspired UI with full admin
        parity, built on top of Home Assistant's REST, WebSocket, and Assist Pipeline APIs.
      </div>
    </>
  );
}
