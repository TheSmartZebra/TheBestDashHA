"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../ds/Icon";
import { ToggleSwitch } from "../ds/ToggleSwitch";
import { useAllStates } from "../../store/entities-store";
import { friendlyName, kindColorVar } from "../../lib/ha/entity-model";
import type { TileEntry } from "../../lib/ha/dashboard";
import styles from "./EntityVisibilityEditor.module.css";

interface AreaGroup {
  areaLabel: string;
  tiles: TileEntry[];
}

function groupSorted(tiles: TileEntry[]): AreaGroup[] {
  const map = new Map<string, TileEntry[]>();
  for (const t of tiles) {
    if (!map.has(t.areaLabel)) map.set(t.areaLabel, []);
    map.get(t.areaLabel)!.push(t);
  }
  const groups = Array.from(map.entries()).map(([areaLabel, entries]) => ({ areaLabel, tiles: entries }));
  groups.sort((a, b) => {
    if (a.areaLabel === "Other") return 1;
    if (b.areaLabel === "Other") return -1;
    return a.areaLabel.localeCompare(b.areaLabel);
  });
  return groups;
}

export function EntityVisibilityEditor({
  tiles,
  initialVisible,
  onSave,
  saveLabel = "Save",
  secondaryAction
}: {
  tiles: TileEntry[];
  initialVisible: Set<string>;
  onSave: (visibleIds: Set<string>) => void;
  saveLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
}) {
  const states = useAllStates();
  const [visible, setVisible] = useState<Set<string>>(initialVisible);
  // `tiles`/`initialVisible` start empty until the WS connection delivers real
  // entity/registry data, so the initial useState above locks in an empty set.
  // Seed once, the first time real tiles show up; afterward the user owns
  // `visible` and we must not clobber their in-progress choices on every
  // upstream re-render (entity state changes constantly while this is open).
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || tiles.length === 0) return;
    seededRef.current = true;
    setVisible(new Set(initialVisible));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once on first non-empty load, not on every initialVisible identity change
  }, [tiles.length]);
  const groups = useMemo(() => groupSorted(tiles), [tiles]);
  const total = tiles.length;
  const selectedCount = tiles.filter((t) => visible.has(t.entityId)).length;

  function toggle(entityId: string) {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  }

  function setArea(areaTiles: TileEntry[], on: boolean) {
    setVisible((prev) => {
      const next = new Set(prev);
      for (const t of areaTiles) {
        if (on) next.add(t.entityId);
        else next.delete(t.entityId);
      }
      return next;
    });
  }

  return (
    <div>
      <div className={styles.summaryBar}>
        <span>
          {selectedCount} of {total} entities selected
        </span>
        <div className={styles.summaryActions}>
          <button className={styles.linkButton} onClick={() => setVisible(new Set(tiles.map((t) => t.entityId)))}>
            Select all
          </button>
          <button className={styles.linkButton} onClick={() => setVisible(new Set())}>
            Select none
          </button>
        </div>
      </div>

      <div className={styles.groups}>
        {groups.map((group) => {
          const groupSelected = group.tiles.filter((t) => visible.has(t.entityId)).length;
          const allOn = groupSelected === group.tiles.length;
          return (
            <div key={group.areaLabel} className={styles.group}>
              <div className={styles.groupHead}>
                <span className={styles.groupTitle}>{group.areaLabel}</span>
                <span className={styles.groupCount}>{groupSelected}/{group.tiles.length}</span>
                <button className={styles.linkButton} onClick={() => setArea(group.tiles, !allOn)}>
                  {allOn ? "Clear room" : "Select room"}
                </button>
              </div>
              <div className={styles.rows}>
                {group.tiles.map((t) => {
                  const entity = states[t.entityId];
                  const on = visible.has(t.entityId);
                  return (
                    <div key={t.entityId} className={styles.row}>
                      <span className={styles.rowIcon} style={{ background: kindColorVar(t.kind) }}>
                        <Icon kind={t.kind} color="#fff" size={14} />
                      </span>
                      <span className={styles.rowName}>
                        {entity ? friendlyName(entity) : t.entityId}
                        <span className={styles.rowId}>{t.entityId}</span>
                      </span>
                      <ToggleSwitch on={on} onClick={() => toggle(t.entityId)} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {groups.length === 0 ? <div className={styles.empty}>No entities found yet — check that Home Assistant is connected.</div> : null}
      </div>

      <div className={styles.footer}>
        {secondaryAction ? (
          <button className={styles.secondaryButton} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </button>
        ) : (
          <span />
        )}
        <button className={styles.primaryButton} onClick={() => onSave(visible)}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
