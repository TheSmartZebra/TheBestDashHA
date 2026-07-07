"use client";

import { useEffect, type ReactNode } from "react";
import { getHaClient } from "../../lib/ha/client";

export function HaConnectionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const client = getHaClient();
    client.connect();
    return () => client.disconnect();
  }, []);

  return <>{children}</>;
}
