"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface Props {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  const { t } = useTranslation();
  const positiveStatuses = [
    "Active",
    "Paid",
    t("common.active"),
    t("common.paid"),
  ];
  const pendingStatuses = ["Pending", t("tables.receiptPending")];
  const isPositive = positiveStatuses.includes(status);
  const isPending = pendingStatuses.includes(status);

  return (
    <span
      className={cn(
        "inline-flex min-w-20 items-center justify-center rounded-md p-2 text-[12px] font-semibold",
        isPositive && "bg-brand-soft text-brand",
        isPending && "bg-warning/20 text-[#9A6400]",
        !isPositive && !isPending && "bg-danger-soft text-danger",
        className
      )}
    >
      {status}
    </span>
  );
}
