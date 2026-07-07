import type { ReactNode } from "react";
import { QueryProvider } from "../../components/providers/QueryProvider";
import { HaConnectionProvider } from "../../components/providers/HaConnectionProvider";
import { AppSettingsProvider } from "../../components/providers/AppSettingsProvider";
import { AppShell } from "../../components/layout/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <HaConnectionProvider>
        <AppSettingsProvider>
          <AppShell>{children}</AppShell>
        </AppSettingsProvider>
      </HaConnectionProvider>
    </QueryProvider>
  );
}
