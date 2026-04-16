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
import type { AdminPaymentListItem } from "@/lib/api/types";
import { formatCurrency, formatDate, formatMonths, getPageCount } from "@/lib/format";
import { useAdminPaymentsQuery } from "@/lib/query/hooks";
import type { Payment } from "@/types";

const PAGE_SIZE = 8;

export default function PaymentsTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentListItem | null>(null);
  const paymentsQuery = useAdminPaymentsQuery({
    limit: PAGE_SIZE,
    search: query || undefined,
    skip: (page - 1) * PAGE_SIZE,
    sortDir: "desc",
  });
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

  function toReceiptPayment(payment: AdminPaymentListItem): Payment {
    return {
      agentId: payment.agentId ?? "admin",
      agentName: payment.agentName ?? "Admin",
      amount: formatCurrency(payment.amount),
      billingMonth: formatMonths(payment.months ?? payment.month),
      clientId: payment.clientId ?? "",
      clientName: payment.clientName ?? "-",
      date: formatDate(payment.paymentDate ?? payment.createdAt),
      id: payment.paymentId,
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
                key={payment.paymentId}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                  {payment.clientName ?? "-"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {payment.agentName ?? "Admin"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
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
                      {payment.clientId ? (
                        <Menu.Item component={Link} href={`/clients/${payment.clientId}`}>
                          {t("tables.viewClient")}
                        </Menu.Item>
                      ) : null}
                      {payment.agentId ? (
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
