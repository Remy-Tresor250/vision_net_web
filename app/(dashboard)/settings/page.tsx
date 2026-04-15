import type { Metadata } from "next";

import SettingsPanel from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings | Vision Net",
  description: "Manage your Vision Net admin account.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
