"use client";

import Link from "next/link";
import { Header } from "../../../components/layout/Header";
import adminStyles from "../../../components/admin/admin.module.css";

const LINKS = [
  { href: "/settings/dashboard-entities", label: "Dashboard Entities", desc: "Choose which entities show up on your dashboard, grouped by room." },
  { href: "/settings/appearance", label: "Appearance", desc: "Light/dark theme, accent color, and background tint." }
];

export default function SettingsIndexPage() {
  return (
    <>
      <Header title="Settings" showEdit={false} />
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={adminStyles.card} style={{ display: "block", color: "var(--ink)" }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{l.label}</div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>{l.desc}</div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 20, fontSize: 13, opacity: 0.5 }}>Use the ⋯ menu to jump to any Home Assistant settings section.</div>
    </>
  );
}
