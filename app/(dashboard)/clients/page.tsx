import type { Metadata } from "next";

import ClientsTable from "@/components/dashboard/ClientsTable";

export const metadata: Metadata = {
  title: "Clients | Vision Net",
  description: "Manage all Vision Net clients.",
};

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <ClientsTable />
    </div>
  );
}
