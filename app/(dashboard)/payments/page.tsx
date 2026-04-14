import type { Metadata } from "next";

import PaymentsTable from "@/components/dashboard/PaymentsTable";

export const metadata: Metadata = {
  title: "Payments | Vision Net",
  description: "Monitor all Vision Net payments.",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PaymentsTable />
    </div>
  );
}
