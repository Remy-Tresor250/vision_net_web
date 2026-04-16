"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Pagination,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineUser,
} from "react-icons/hi2";

import ErrorState from "@/components/dashboard/ErrorState";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import {
  formatCurrency,
  formatDate,
  formatMonths,
  getPageCount,
} from "@/lib/format";
import { useAdminAgentQuery, useAdminPaymentsQuery } from "@/lib/query/hooks";
import type { AdminPaymentListItem } from "@/lib/api/types";
import type { Payment } from "@/types";
import { useTranslation } from "react-i18next";

interface Props {
  agentId: string;
}

const PAGE_SIZE = 7;

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
    months: String(payment.months?.length ?? 1),
    receiptNumber: payment.receiptNumber ?? "-",
    status: "Paid",
  };
}

export default function AgentDetailsPanel({ agentId }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<AdminPaymentListItem | null>(null);
  const agentQuery = useAdminAgentQuery(agentId);
  const paymentsQuery = useAdminPaymentsQuery({
    agentId,
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    sortDir: "desc",
  });
  const agent = agentQuery.data;
  const payments = paymentsQuery.data?.data ?? [];
  const totalPages = getPageCount(paymentsQuery.data?.total ?? 0, PAGE_SIZE);

  if (agentQuery.isError) {
    return (
      <ErrorState
        message={t("dashboard.couldNotLoad")}
        reset={() => agentQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link className="flex items-center gap-3 text-text-muted" href="/agents">
        <HiOutlineArrowLeft className="size-5" />
        <div className="text-[16px] font-medium transition-colors duration-200 ease-out hover:text-foreground">
          {t("common.backToAgents")}
        </div>
      </Link>

      <section className="rounded-sm border border-border bg-surface px-7 py-6 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex size-16 items-center justify-center rounded-md bg-brand text-white">
            <HiOutlineUser className="size-6" />
          </div>
          <div className="flex flex-1 gap-[5vw] flex-row items-center">
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                {t("common.fullNames")}
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {agentQuery.isLoading
                  ? t("common.loading")
                  : (agent?.fullNames ?? "-")}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                {t("common.registeredDate")}
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {formatDate(agent?.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                {t("common.phoneNumber")}
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {agentQuery.isLoading
                  ? t("common.loading")
                  : (agent?.phone ?? "-")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid max-w-3xl gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t("tables.totalCollected")}
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                {formatCurrency(
                  agent?.currentMonthCollected ?? agent?.totalAmountCollected,
                )}
              </p>
            </div>
            <div className="flex h-10 min-w-18 items-center justify-center rounded-md bg-surface-muted px-4 text-text-muted">
              <HiOutlineBanknotes className="size-5" />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t("tables.uniqueClients")}
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                {agent?.uniqueClientsCollectedFrom ?? 0}
              </p>
            </div>
            <div className="flex h-10 min-w-18 items-center justify-center rounded-md bg-surface-muted px-4 text-text-muted">
              <HiOutlineBanknotes className="size-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <TableScrollContainer minWidth={1080}>
          <Table className="min-w-full">
            <TableThead className="bg-surface-muted">
              <TableTr>
                {[
                  t("common.clientName"),
                  t("tables.dateCollected"),
                  t("common.month"),
                  t("common.amount"),
                  t("common.receipt"),
                ].map((header) => (
                  <TableTh
                    key={header}
                    className="px-7 py-5 text-sm font-semibold uppercase tracking-wider text-text-muted"
                    styles={{ th: { padding: 12 } }}
                  >
                    {header}
                  </TableTh>
                ))}
              </TableTr>
            </TableThead>
            <TableTbody>
              {paymentsQuery.isLoading || paymentsQuery.isFetching ? (
                <TableSkeletonRows columns={5} rows={PAGE_SIZE} />
              ) : payments.length === 0 ? (
                <TableEmptyRow
                  colSpan={5}
                  message={t("tables.collectionsEmpty")}
                  title={t("tables.noCollectionsFound")}
                />
              ) : (
                payments.map((payment) => (
                  <TableTr
                    key={payment.paymentId}
                    className="border-b border-border last:border-b-0"
                  >
                    <TableTd className="px-7 py-6 text-[14px] font-medium text-foreground">
                      {payment.clientName ?? "-"}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                      {formatDate(payment.paymentDate ?? payment.createdAt)}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                      {formatMonths(payment.months ?? payment.month)}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                      {formatCurrency(payment.amount)}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px]">
                      <button
                        className="font-medium text-brand underline decoration-brand/40 underline-offset-4 disabled:text-text-muted disabled:no-underline"
                        onClick={() => setSelectedPayment(payment)}
                        type="button"
                      >
                        {t("common.view")}
                      </button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </TableScrollContainer>
        <div className="flex justify-center px-6 py-7">
          <Pagination
            boundaries={1}
            color="brand"
            onChange={setPage}
            radius="xl"
            siblings={2}
            total={totalPages}
            value={page}
          />
        </div>
      </section>
      <ReceiptModal
        onClose={() => setSelectedPayment(null)}
        opened={selectedPayment !== null}
        payment={selectedPayment ? toReceiptPayment(selectedPayment) : null}
      />
    </div>
  );
}
