"use client";

import { useCallback, useRef, useState } from "react";
import type { HassEntity } from "../lib/ha/types";
import { brightnessPct, coverPositionPct, gestureKindFor, volumePct, type Kind } from "../lib/ha/entity-model";
import { useEntityActions } from "./useEntityActions";

const MOVE_THRESHOLD = 7;
const HOLD_MS = 600;

interface Options {
  entity: HassEntity;
  kind: Kind;
  vertical?: boolean;
  editMode: boolean;
  onTogglePin: () => void;
}

interface PressState {
  x0: number;
  y0: number;
  v0: number;
  span: number;
  moved: boolean;
}

export function useTileGesture({ entity, kind, vertical, editMode, onTogglePin }: Options) {
  const actions = useEntityActions(entity.entity_id, kind);
  const gestureKind = gestureKindFor(kind);
  const [dragPct, setDragPct] = useState<number | null>(null);
  const [holding, setHolding] = useState(false);

  const press = useRef<PressState | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);

  const baselinePct = useCallback(() => {
    if (kind === "light") return brightnessPct(entity);
    if (kind === "cover") return coverPositionPct(entity);
    if (kind === "media_player") return volumePct(entity);
    return 0;
  }, [entity, kind]);

  const commit = useCallback(
    (pct: number) => {
      if (kind === "light") actions.setBrightnessPct(pct);
      if (kind === "cover") actions.setCoverPositionPct(pct);
      if (kind === "media_player") actions.setVolumePct(pct);
    },
    [actions, kind]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest?.("button")) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const rect = e.currentTarget.getBoundingClientRect();
      press.current = {
        x0: e.clientX,
        y0: e.clientY,
        v0: baselinePct(),
        span: vertical ? 110 : rect.width,
        moved: false
      };

      if (gestureKind === "hold-unlock" && entity.state === "locked" && !editMode) {
        setHolding(true);
        holdTimer.current = setTimeout(() => {
          heldRef.current = true;
          actions.unlock();
          setHolding(false);
        }, HOLD_MS);
      }
    },
    [baselinePct, vertical, gestureKind, entity.state, editMode, actions]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const p = press.current;
      if (!p || editMode) return;

      if (gestureKind === "hold-unlock") {
        const dx = e.clientX - p.x0;
        const dy = e.clientY - p.y0;
        if (Math.hypot(dx, dy) > MOVE_THRESHOLD && holdTimer.current) {
          clearTimeout(holdTimer.current);
          holdTimer.current = null;
          setHolding(false);
        }
        return;
      }

      const draggable =
        gestureKind === "drag-brightness" ||
        gestureKind === "drag-position" ||
        (gestureKind === "media-drag-volume" && entity.state === "playing");
      if (!draggable) return;

      const dx = e.clientX - p.x0;
      const dy = p.y0 - e.clientY;
      const delta = vertical ? dy : dx;
      if (!p.moved && Math.abs(delta) < MOVE_THRESHOLD) return;
      p.moved = true;
      const nv = Math.max(0, Math.min(100, Math.round(p.v0 + (delta / p.span) * 100)));
      setDragPct(nv);
    },
    [editMode, gestureKind, vertical, entity.state]
  );

  const onPointerUp = useCallback(() => {
    const p = press.current;
    press.current = null;

    if (gestureKind === "hold-unlock") {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      setHolding(false);
      if (heldRef.current) {
        heldRef.current = false;
        return;
      }
      if (editMode) {
        onTogglePin();
        return;
      }
      if (entity.state !== "locked") actions.lock();
      return;
    }

    if (p && p.moved) {
      setDragPct((nv) => {
        if (nv != null) commit(nv);
        return null;
      });
      return;
    }

    if (editMode) {
      onTogglePin();
      return;
    }

    if (gestureKind === "media-drag-volume") {
      actions.mediaPlayPause();
    } else if (gestureKind === "toggle" || gestureKind === "drag-brightness" || gestureKind === "drag-position") {
      actions.toggle();
    } else if (gestureKind === "cycle-fan-speed") {
      actions.toggle();
    }
  }, [gestureKind, editMode, entity.state, actions, commit, onTogglePin]);

  const onPointerCancel = useCallback(() => {
    press.current = null;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setHolding(false);
    setDragPct(null);
  }, []);

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    dragPct,
    holding,
    actions
  };
}
