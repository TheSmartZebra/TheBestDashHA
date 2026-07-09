"use client";

import { useState } from "react";
import Link from "next/link";
import { IconButton } from "../ds/IconButton";
import { Icon } from "../ds/Icon";
import { Modal } from "../ds/Modal";
import { AssistOverlay } from "../assist/AssistOverlay";
import { useUiStore } from "../../store/ui-store";
import { useNarrow } from "../../hooks/useNarrow";
import styles from "./Header.module.css";

const SERVICE_ITEMS: { label: string; href: string }[] = [
  { label: "Settings", href: "/settings" },
  { label: "Dashboard Entities", href: "/settings/dashboard-entities" },
  { label: "Appearance", href: "/settings/appearance" },
  { label: "Devices & Services", href: "/settings/devices-services" },
  { label: "Entities", href: "/settings/entities" },
  { label: "Automations & Scenes", href: "/settings/automations-scenes" },
  { label: "Areas & Dashboards", href: "/settings/areas-dashboards" },
  { label: "People & Zones", href: "/settings/people-zones" },
  { label: "Add-ons", href: "/settings/addons" },
  { label: "System · Backups", href: "/settings/system/backups" },
  { label: "System · Updates", href: "/settings/system/updates" },
  { label: "Developer Tools", href: "/settings/developer-tools/states" }
];
const SERVICE_ITEMS_2: { label: string; href: string }[] = [
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Activity History", href: "/settings/history" },
  { label: "About Home Assistant", href: "/settings/about" }
];
const ADD_ITEMS = ["Add Accessory", "Add Scene", "Add Automation", "Add Room"];

export function Header({ title, summary, showEdit = true }: { title: string; summary?: string; showEdit?: boolean }) {
  const narrow = useNarrow();
  const { menu, setMenu, closeMenus, modal, openModal, closeModal, openSidebar, edit, toggleEdit } = useUiStore();
  const [assistOpen, setAssistOpen] = useState(false);

  return (
    <div className={styles.header}>
      {narrow ? (
        <IconButton onClick={openSidebar} title="Menu">
          <Icon kind="ham" color="var(--ink)" size={18} />
        </IconButton>
      ) : null}

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{title}</h1>
        {summary ? <div className={styles.summary}>{summary}</div> : null}
      </div>

      <div className={styles.actions}>
        <IconButton onClick={() => setMenu((m) => (m === "add" ? null : "add"))} title="Add">
          <Icon kind="plus" color="var(--ink)" size={18} />
        </IconButton>
        <IconButton onClick={() => setAssistOpen(true)} title="Assist">
          <Icon kind="mic" color="var(--ink)" size={18} />
        </IconButton>
        {showEdit ? (
          <IconButton onClick={toggleEdit} active={edit} title="Edit favorites">
            <Icon kind="sliders" color={edit ? "#15161a" : "var(--ink)"} size={18} />
          </IconButton>
        ) : null}
        <IconButton onClick={() => setMenu((m) => (m === "service" ? null : "service"))} title="Home Assistant settings">
          <Icon kind="dots" color="var(--ink)" size={18} />
        </IconButton>

        {menu ? (
          <>
            <div className={styles.menuOverlay} onClick={closeMenus} />
            <div className={styles.menu}>
              {menu === "service" ? (
                <>
                  <div className={styles.menuHead}>Home Assistant</div>
                  {SERVICE_ITEMS.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.menuRow} onClick={closeMenus}>
                      {item.label}
                    </Link>
                  ))}
                  <div className={styles.menuDivider} />
                  {SERVICE_ITEMS_2.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.menuRow} onClick={closeMenus}>
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <div className={styles.menuHead}>Add to My Home</div>
                  {ADD_ITEMS.map((label) => (
                    <button key={label} className={styles.menuRow} onClick={() => openModal(label)}>
                      {label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>

      {modal ? (
        <Modal
          title={modal}
          body={`"${modal}" will open its full flow once Devices & Services / Automations editor ships (see the project's phased plan). For now this confirms the action is wired up and ready to connect.`}
          onClose={closeModal}
        />
      ) : null}

      {assistOpen ? <AssistOverlay onClose={() => setAssistOpen(false)} /> : null}
    </div>
  );
}
