import type { ReactNode } from "react";
import { QueryProvider } from "../../components/providers/QueryProvider";
import { HaConnectionProvider } from "../../components/providers/HaConnectionProvider";
import { AppSettingsProvider } from "../../components/providers/AppSettingsProvider";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <HaConnectionProvider>
        <AppSettingsProvider>{children}</AppSettingsProvider>
      </HaConnectionProvider>
    </QueryProvider>
  );
}
