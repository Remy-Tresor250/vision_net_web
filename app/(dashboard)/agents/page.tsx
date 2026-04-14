import type { Metadata } from "next";

import AgentsTable from "@/components/dashboard/AgentsTable";

export const metadata: Metadata = {
  title: "Agents | Vision Net",
  description: "Manage all Vision Net field agents.",
};

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <AgentsTable />
    </div>
  );
}
