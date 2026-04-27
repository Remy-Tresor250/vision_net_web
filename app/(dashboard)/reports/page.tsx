import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import ReportsPanel from "@/components/dashboard/ReportsPanel";

export const metadata: Metadata = {
  title: "Reports | Vision Net",
};

export default function ReportsPage() {
  return (
    <PermissionGuard anyOf={["reports.view", "reports.create"]}>
      <ReportsPanel />
    </PermissionGuard>
  );
}
