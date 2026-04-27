import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import ClientsTable from "@/components/dashboard/ClientsTable";
import { normalizeClientType } from "@/lib/client-type";

export const metadata: Metadata = {
  title: "Clients | Vision Net",
  description: "Manage all Vision Net clients.",
};

interface ClientsPageProps {
  searchParams: Promise<{ clientType?: string | string[] }>;
}

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const params = await searchParams;
  const initialClientType = normalizeClientType(
    typeof params.clientType === "string" ? params.clientType : undefined,
  );

  return (
    <PermissionGuard anyOf={["clients.view"]}>
      <div className="space-y-6">
        <ClientsTable initialClientType={initialClientType} />
      </div>
    </PermissionGuard>
  );
}
