"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getHaClient } from "../../lib/ha/client";
import { lighten } from "../../lib/color";
import { APP_USER_DATA_KEY, DEFAULT_APP_USER_DATA, type AppUserData, type ThemeMode } from "../../lib/ha/types";

interface AppSettingsContextValue {
  settings: AppUserData;
  loaded: boolean;
  resolvedTheme: "light" | "dark";
  setAccent: (accent: string) => void;
  setTint: (tint: AppUserData["tint"]) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setShowScenes: (show: boolean) => void;
  togglePin: (entityId: string) => void;
  isPinned: (entityId: string) => boolean;
  /** Persists the wizard's chosen hidden-entity set and marks onboarding complete. */
  completeOnboarding: (hiddenEntities: string[]) => void;
  setHiddenEntities: (hiddenEntities: string[]) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return prefersDark;
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppUserData>(DEFAULT_APP_USER_DATA);
  const [loaded, setLoaded] = useState(false);
  const systemPrefersDark = useSystemPrefersDark();

  const resolvedTheme: "light" | "dark" =
    settings.themeMode === "system" ? (systemPrefersDark ? "dark" : "light") : settings.themeMode;

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
    root.setAttribute("data-theme", resolvedTheme);
  }, [settings.accent, settings.tint, resolvedTheme]);

  function persist(next: AppUserData) {
    setSettings(next);
    void getHaClient().setUserData(APP_USER_DATA_KEY, next);
  }

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loaded,
      resolvedTheme,
      setAccent: (accent) => persist({ ...settings, accent }),
      setTint: (tint) => persist({ ...settings, tint }),
      setThemeMode: (themeMode) => persist({ ...settings, themeMode }),
      setShowScenes: (showScenes) => persist({ ...settings, showScenes }),
      togglePin: (entityId) => {
        const pinned = settings.pinned.includes(entityId)
          ? settings.pinned.filter((id) => id !== entityId)
          : [...settings.pinned, entityId];
        persist({ ...settings, pinned });
      },
      isPinned: (entityId) => settings.pinned.includes(entityId),
      completeOnboarding: (hiddenEntities) => persist({ ...settings, hiddenEntities, onboarded: true }),
      setHiddenEntities: (hiddenEntities) => persist({ ...settings, hiddenEntities })
    }),
    [settings, loaded, resolvedTheme]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
