"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import ReceiptModal from "@/components/dashboard/ReceiptModal";
import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { hasAnyPermission } from "@/lib/auth/permissions";
import type { AdminPaymentListItem, AdminPaymentsParams } from "@/lib/api/types";
import { formatCurrency, formatDate, formatMonths, getPageCount } from "@/lib/format";
import { getAdminPaymentId } from "@/lib/payment";
import { useAdminPaymentsQuery } from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";
import type { Payment } from "@/types";

const PAGE_SIZE = 8;

export default function PaymentsTable() {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canViewClients = hasAnyPermission(permissions, ["clients.view"]);
  const canViewAgents = hasAnyPermission(permissions, ["agents.view"]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    amountMax: "",
    amountMin: "",
    dateFrom: "",
    dateTo: "",
    month: "",
    setByAdmin: "",
    sortBy: "",
    sortDir: "desc",
  });
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentListItem | null>(null);
  const paymentParams: AdminPaymentsParams = {
    amountMax: filters.amountMax || undefined,
    amountMin: filters.amountMin || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    limit: PAGE_SIZE,
    month: filters.month || undefined,
    search: query || undefined,
    setByAdmin:
      filters.setByAdmin === "true"
        ? true
        : filters.setByAdmin === "false"
          ? false
          : undefined,
    skip: (page - 1) * PAGE_SIZE,
    sortBy: filters.sortBy || undefined,
    sortDir: (filters.sortDir as "asc" | "desc") || undefined,
  };
  const paymentsQuery = useAdminPaymentsQuery(paymentParams);
  const payments = [...(paymentsQuery.data?.data ?? [])].sort((left, right) => {
    const leftIsOverdue = left.status === "DUE" ? 1 : 0;
    const rightIsOverdue = right.status === "DUE" ? 1 : 0;

    if (leftIsOverdue !== rightIsOverdue) {
      return rightIsOverdue - leftIsOverdue;
    }

    const leftDate = new Date(left.dueDate ?? left.paymentDate ?? left.createdAt ?? 0).getTime();
    const rightDate = new Date(right.dueDate ?? right.paymentDate ?? right.createdAt ?? 0).getTime();

    return rightDate - leftDate;
  });
  const totalPages = getPageCount(paymentsQuery.data?.total ?? 0, PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(value: Record<string, string>) {
    setFilters(value);
    setPage(1);
  }

  function toReceiptPayment(payment: AdminPaymentListItem): Payment {
    const paymentId = getAdminPaymentId(payment);

    return {
      agentId: payment.agentId ?? "admin",
      agentName: payment.agentName ?? "Admin",
      amount: formatCurrency(payment.amount),
      billingMonth: formatMonths(payment.months ?? payment.month),
      clientId: payment.clientId ?? "",
      clientName: payment.clientName ?? "-",
      date: formatDate(payment.paymentDate ?? payment.createdAt),
      id: paymentId,
      receiptId: payment.receiptId ?? undefined,
      receiptNumber: payment.receiptNumber ?? "-",
      clientPhone: payment.clientPhone ?? undefined,
      months: String(payment.months?.length ?? 1),
      status: payment.status === "DUE" ? "Overdue" : "Paid",
    };
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        filterFields={[
          {
            id: "setByAdmin",
            label: t("filters.adminEntry"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("common.yes"), value: "true" },
              { label: t("common.no"), value: "false" },
            ],
            type: "select",
          },
          { id: "month", label: t("filters.month"), type: "month" },
          { id: "dateFrom", label: t("filters.dateFrom"), type: "date" },
          { id: "dateTo", label: t("filters.dateTo"), type: "date" },
          { id: "amountMin", label: t("filters.amountMin"), type: "number" },
          { id: "amountMax", label: t("filters.amountMax"), type: "number" },
          {
            id: "sortBy",
            label: t("filters.sortBy"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("common.date"), value: "paymentDate" },
              { label: t("common.amount"), value: "amount" },
              { label: t("filters.createdAtFrom"), value: "createdAt" },
            ],
            type: "select",
          },
          {
            id: "sortDir",
            label: t("filters.sortDir"),
            options: [
              { label: t("common.all"), value: "" },
              { label: "ASC", value: "asc" },
              { label: "DESC", value: "desc" },
            ],
            type: "select",
          },
        ]}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        title={t("dashboard.allPayments")}
        onQueryChange={handleQueryChange}
        placeholder={t("tables.searchPayments")}
        query={query}
      />
      <DashboardTableShell
        headers={[
          t("common.clientName"),
          t("common.agentName"),
          t("common.months"),
          t("common.date"),
          t("common.amount"),
          t("common.status"),
          t("common.details"),
        ]}
        onPageChange={setPage}
        page={page}
        total={totalPages}
      >
        {paymentsQuery.isLoading
          ? <TableSkeletonRows columns={7} rows={PAGE_SIZE} />
          : payments.length === 0
          ? (
              <TableEmptyRow
                colSpan={7}
                message={t("tables.paymentsEmpty")}
                title={t("tables.noPaymentsFound")}
              />
            )
          : payments.map((payment) => (
              <TableTr
                key={getAdminPaymentId(payment) || payment.receiptId || payment.createdAt}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                  {payment.clientName ?? "-"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {payment.agentName ?? "Admin"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted max-w-[200px]">
                  {formatMonths(payment.months ?? payment.month)}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatDate(payment.paymentDate ?? payment.createdAt)}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatCurrency(payment.amount)}
                </TableTd>
                <TableTd className="px-8 py-6">
                  <StatusBadge status={payment.status === "DUE" ? t("common.overdue") : t("common.paid")} />
                </TableTd>
                <TableTd className="px-8 py-6 text-center">
                  <Menu position="bottom-end" shadow="md" width={190}>
                    <Menu.Target>
                      <Button
                        aria-label={`Open details for ${payment.clientName ?? "payment"}`}
                        size="icon"
                        variant="subtle"
                      >
                        <HiEllipsisHorizontal className="size-6" />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {canViewClients && payment.clientId ? (
                        <Menu.Item component={Link} href={`/clients/${payment.clientId}`}>
                          {t("tables.viewClient")}
                        </Menu.Item>
                      ) : null}
                      {canViewAgents && payment.agentId ? (
                        <Menu.Item component={Link} href={`/agents/${payment.agentId}`}>
                          {t("tables.viewAgent")}
                        </Menu.Item>
                      ) : null}
                      {payment.status !== "DUE" ? (
                        <Menu.Item onClick={() => setSelectedPayment(payment)}>
                          {t("tables.viewReceipt")}
                        </Menu.Item>
                      ) : null}
                    </Menu.Dropdown>
                  </Menu>
                </TableTd>
              </TableTr>
            ))}
      </DashboardTableShell>
      <ReceiptModal
        onClose={() => setSelectedPayment(null)}
        opened={selectedPayment !== null}
        payment={selectedPayment ? toReceiptPayment(selectedPayment) : null}
      />
    </div>
  );
}
