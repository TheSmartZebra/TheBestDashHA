"use client";

import { useCallback, useRef, useState } from "react";

export function useThermostatDrag(min: number, max: number, step: number, onCommit: (v: number) => void) {
  const ref = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const angleToValue = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angleDeg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
      const deg = (angleDeg + 90 + 360) % 360;
      const frac = deg / 360;
      const raw = min + frac * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      dragging.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      e.stopPropagation();
      const v = angleToValue(e.clientX, e.clientY);
      if (v != null) setDragValue(v);
    },
    [angleToValue]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (!dragging.current) return;
      e.stopPropagation();
      const v = angleToValue(e.clientX, e.clientY);
      if (v != null) setDragValue(v);
    },
    [angleToValue]
  );

  const end = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      e.stopPropagation();
      setDragValue((v) => {
        if (v != null) onCommit(v);
        return null;
      });
    },
    [onCommit]
  );

  return {
    ref,
    dragValue,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end
    }
  };
}
