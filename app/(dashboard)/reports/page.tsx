import type { Metadata } from "next";

import ReportsPanel from "@/components/dashboard/ReportsPanel";

export const metadata: Metadata = {
  title: "Reports | Vision Net",
};

export default function ReportsPage() {
  return <ReportsPanel />;
}
