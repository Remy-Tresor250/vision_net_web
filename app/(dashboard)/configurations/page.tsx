import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import ConfigurationsPanel from "@/components/dashboard/ConfigurationsPanel";

export const metadata: Metadata = {
  title: "Configurations | Vision Net",
};

export default function ConfigurationsPage() {
  return (
    <PermissionGuard
      anyOf={[
        "locations.view",
        "service_types.view",
        "commissions.view",
        "commissions.edit",
      ]}
    >
      <ConfigurationsPanel />
    </PermissionGuard>
  );
}
