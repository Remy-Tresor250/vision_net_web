import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import PaymentsTable from "@/components/dashboard/PaymentsTable";

export const metadata: Metadata = {
  title: "Payments | Vision Net",
  description: "Monitor all Vision Net payments.",
};

export default function PaymentsPage() {
  return (
    <PermissionGuard anyOf={["payments.view"]}>
      <div className="space-y-6">
        <PaymentsTable />
      </div>
    </PermissionGuard>
  );
}
