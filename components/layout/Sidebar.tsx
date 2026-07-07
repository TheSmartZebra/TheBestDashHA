"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../ds/Icon";
import { useAreaList, useStatCards } from "../../hooks/useDashboard";
import { useUiStore } from "../../store/ui-store";
import { useNarrow } from "../../hooks/useNarrow";
import { CATEGORY_LABEL, type Category } from "../../lib/ha/entity-model";
import styles from "./Sidebar.module.css";

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

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home", color: "var(--accent)" },
  { href: "/automation", label: "Automation", icon: "clock", color: "var(--kind-fan)" },
  { href: "/discover", label: "Discover", icon: "diamond", color: "var(--kind-media)" }
];

export function Sidebar() {
  const pathname = usePathname();
  const areas = useAreaList();
  const statCards = useStatCards();
  const narrow = useNarrow();
  const { sbOpen, closeSidebar } = useUiStore();

  const isSbOpen = !narrow || sbOpen;

  return (
    <>
      {narrow && sbOpen ? <div className={styles.backdrop} onClick={closeSidebar} /> : null}
      <div
        className={`${styles.sidebar} ${narrow ? styles.sidebarNarrow : ""} ${isSbOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.navGroup}>
          {NAV_ITEMS.map((n) => {
            const selected = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} onClick={closeSidebar} className={`${styles.navRow} ${selected ? styles.navRowSelected : ""}`}>
                <span className={styles.navIcon} style={selected ? { background: n.color } : undefined}>
                  <Icon kind={n.icon} color={selected ? "#fff" : "rgba(255,255,255,.6)"} size={15} />
                </span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.sectionLabel}>Categories</div>
        <div className={styles.navGroup}>
          {(Object.keys(CATEGORY_LABEL) as NonNullable<Category>[]).map((key) => {
            const href = `/category/${key}`;
            const selected = pathname === href;
            const anyOn = statCards.find((s) => s.key === key)?.anyOn;
            return (
              <Link key={key} href={href} onClick={closeSidebar} className={`${styles.navRow} ${selected ? styles.navRowSelected : ""}`}>
                <span className={styles.navIcon} style={anyOn ? { background: CATEGORY_COLOR_VAR[key] } : undefined}>
                  <Icon kind={CATEGORY_ICON[key]} color={anyOn ? "#fff" : "rgba(255,255,255,.6)"} size={15} />
                </span>
                <span>{CATEGORY_LABEL[key]}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.sectionLabel}>Rooms</div>
        <div className={styles.navGroup}>
          {areas.map((a) => {
            const href = `/rooms/${a.area_id}`;
            const selected = pathname === href;
            return (
              <Link key={a.area_id} href={href} onClick={closeSidebar} className={`${styles.navRow} ${selected ? styles.navRowSelected : ""}`}>
                <span className={styles.navIcon} style={selected ? { background: "var(--accent)" } : undefined}>
                  <Icon kind="door" color={selected ? "#fff" : "rgba(255,255,255,.6)"} size={15} />
                </span>
                <span>{a.name}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.profile}>
          <button className={styles.profileButton}>
            <span className={styles.avatar}>A</span>
            <span className={styles.profileText}>
              <span className={styles.profileName}>Alex</span>
              <span className={styles.profileSub}>My Home</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
