import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import AgentsTable from "@/components/dashboard/AgentsTable";

export const metadata: Metadata = {
  title: "Agents | Vision Net",
  description: "Manage all Vision Net field agents.",
};

export default function AgentsPage() {
  return (
    <PermissionGuard anyOf={["agents.view"]}>
      <div className="space-y-6">
        <AgentsTable />
      </div>
    </PermissionGuard>
  );
}
