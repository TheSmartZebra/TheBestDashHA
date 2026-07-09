"use client";

import { usePathname, useRouter } from "next/navigation";
import { StatCard } from "../ds/StatCard";
import { Icon } from "../ds/Icon";
import { useStatCards } from "../../hooks/useDashboard";
import { CATEGORY_LABEL, type Category } from "../../lib/ha/entity-model";

const CATEGORY_ICON: Record<NonNullable<Category>, string> = {
  climate: "climate",
  lights: "light",
  security: "lock",
  cameras: "camera",
  media: "media_player"
};
const CATEGORY_COLOR_VAR: Record<NonNullable<Category>, string> = {
  climate: "var(--kind-climate)",
  lights: "var(--kind-light)",
  security: "var(--kind-lock)",
  cameras: "var(--kind-camera)",
  media: "var(--kind-media)"
};

export function StatCardsRow() {
  const cards = useStatCards();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 2px 4px" }}>
      {cards
        .filter((c) => c.count > 0)
        .map((c) => {
          const href = `/category/${c.key}`;
          const selected = pathname === href;
          return (
            <StatCard
              key={c.key}
              icon={<Icon kind={CATEGORY_ICON[c.key]} color={c.anyOn ? "#fff" : "var(--ink-dim)"} size={17} />}
              iconBg={c.anyOn ? CATEGORY_COLOR_VAR[c.key] : "var(--icon-off-bg)"}
              label={CATEGORY_LABEL[c.key]}
              status={c.status}
              selected={selected}
              onClick={() => router.push(selected ? "/" : href)}
            />
          );
        })}
    </div>
  );
}
