import type { Metadata } from "next";

import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Vision Net",
  description: "Overview of Vision Net admin metrics.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
