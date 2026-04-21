import type { Metadata } from "next";

import ConfigurationsPanel from "@/components/dashboard/ConfigurationsPanel";

export const metadata: Metadata = {
  title: "Configurations | Vision Net",
};

export default function ConfigurationsPage() {
  return <ConfigurationsPanel />;
}
