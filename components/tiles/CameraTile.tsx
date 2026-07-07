"use client";

import { useEffect, useState } from "react";
import { useEntity } from "../../store/entities-store";
import { friendlyName } from "../../lib/ha/entity-model";
import styles from "./CameraTile.module.css";

const REFRESH_MS = 8000;

export function CameraTile({ entityId }: { entityId: string }) {
  const entity = useEntity(entityId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (!entity) return null;
  const live = entity.state === "recording" || entity.state === "streaming";

  return (
    <div className={styles.tile}>
      <img className={styles.img} src={`/api/ha/camera/${entityId}/stream?t=${tick}`} alt={friendlyName(entity)} />
      <div className={styles.overlay}>
        <span className={styles.name}>{friendlyName(entity)}</span>
        {live ? <span className={styles.live}>● Live</span> : null}
      </div>
    </div>
  );
}
