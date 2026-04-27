"use client";

import { useTranslation } from "react-i18next";

import NoDataCard from "@/components/dashboard/NoDataCard";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  anyOf: string[];
  children: React.ReactNode;
  message?: string;
  title?: string;
}

export default function PermissionGuard({
  anyOf,
  children,
  message,
  title,
}: Props) {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);

  if (!hasAnyPermission(permissions, anyOf)) {
    return (
      <NoDataCard
        className="min-h-96"
        message={message ?? t("permissions.pageMessage")}
        title={title ?? t("permissions.pageTitle")}
      />
    );
  }

  return children;
}
