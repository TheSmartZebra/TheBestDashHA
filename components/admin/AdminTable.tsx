"use client";

import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "./admin.module.css";

export interface Column<T> {
  key: string;
  header: string;
  width: string;
  render: (row: T) => ReactNode;
}

export function AdminTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  height = 520,
  emptyMessage = "No results."
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  height?: number;
  emptyMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 42,
    overscan: 12
  });

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        {columns.map((c) => (
          <span key={c.key} className={styles.tableCell} style={{ width: c.width }}>
            {c.header}
          </span>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        <div ref={scrollRef} className={styles.tableScroll} style={{ height }}>
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const row = rows[vi.index]!;
              return (
                <div
                  key={rowKey(row)}
                  className={styles.tableRow}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: vi.size,
                    transform: `translateY(${vi.start}px)`
                  }}
                >
                  {columns.map((c) => (
                    <span key={c.key} className={styles.tableCell} style={{ width: c.width }}>
                      {c.render(row)}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
