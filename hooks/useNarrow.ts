"use client";

import { useEffect, useState } from "react";

export function useNarrow(breakpoint = 880): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return narrow;
}
