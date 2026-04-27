import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import UsersPanel from "@/components/dashboard/UsersPanel";

export const metadata: Metadata = {
  title: "Users | Vision Net",
  description: "Manage admin users and their roles.",
};

export default function UsersPage() {
  return (
    <PermissionGuard anyOf={["admin_users.view", "roles.view"]}>
      <UsersPanel />
    </PermissionGuard>
  );
}
