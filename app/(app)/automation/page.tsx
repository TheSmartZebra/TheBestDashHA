"use client";

import { Header } from "../../../components/layout/Header";
import { AutomationList } from "../../../components/dashboard/AutomationList";
import { useAutomations } from "../../../hooks/useDashboard";

export default function AutomationPage() {
  const automations = useAutomations();
  const enabled = automations.filter((a) => a.on).length;

  return (
    <>
      <Header title="Automation" summary={`${enabled} enabled`} showEdit={false} />
      <AutomationList />
    </>
  );
}
