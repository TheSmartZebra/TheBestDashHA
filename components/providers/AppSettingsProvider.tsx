"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getHaClient } from "../../lib/ha/client";
import { lighten } from "../../lib/color";
import { APP_USER_DATA_KEY, DEFAULT_APP_USER_DATA, type AppUserData } from "../../lib/ha/types";

interface AppSettingsContextValue {
  settings: AppUserData;
  loaded: boolean;
  setAccent: (accent: string) => void;
  setTint: (tint: AppUserData["tint"]) => void;
  setShowScenes: (show: boolean) => void;
  togglePin: (entityId: string) => void;
  isPinned: (entityId: string) => boolean;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppUserData>(DEFAULT_APP_USER_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHaClient()
      .getUserData<AppUserData | null>(APP_USER_DATA_KEY)
      .then((value) => {
        if (cancelled) return;
        if (value) setSettings({ ...DEFAULT_APP_USER_DATA, ...value });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", settings.accent);
    root.style.setProperty("--accent-lite", lighten(settings.accent, 0.14));
    root.setAttribute("data-tint", settings.tint);
  }, [settings.accent, settings.tint]);

  function persist(next: AppUserData) {
    setSettings(next);
    void getHaClient().setUserData(APP_USER_DATA_KEY, next);
  }

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loaded,
      setAccent: (accent) => persist({ ...settings, accent }),
      setTint: (tint) => persist({ ...settings, tint }),
      setShowScenes: (showScenes) => persist({ ...settings, showScenes }),
      togglePin: (entityId) => {
        const pinned = settings.pinned.includes(entityId)
          ? settings.pinned.filter((id) => id !== entityId)
          : [...settings.pinned, entityId];
        persist({ ...settings, pinned });
      },
      isPinned: (entityId) => settings.pinned.includes(entityId)
    }),
    [settings, loaded]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
