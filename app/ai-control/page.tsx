import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "AI Control | Everest AI Assistant",
  description: "AI Studio control center and dashboard.",
};

export default function AiControlPage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}