"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
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
  HiEllipsisHorizontal,
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineUser,
} from "react-icons/hi2";

import Button from "@/components/ui/Button";
import ErrorState from "@/components/dashboard/ErrorState";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import StatusBadge from "@/components/ui/StatusBadge";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, formatMonths } from "@/lib/format";
import {
  useAdminClientPaymentsQuery,
  useAdminClientQuery,
  useMarkClientPaymentCompleteMutation,
} from "@/lib/query/hooks";
import type { AdminPaymentListItem } from "@/lib/api/types";
import { getPageCount } from "@/lib/format";
import type { Payment } from "@/types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface Props {
  clientId: string;
}

const PAGE_SIZE = 7;

function toReceiptPayment(
  payment: AdminPaymentListItem,
  client?: { clientId?: string; fullNames?: string; phone?: string },
): Payment {
  return {
    agentId: payment.agentId ?? "admin",
    agentName: payment.agentName ?? "Admin",
    amount: formatCurrency(payment.amount),
    billingMonth: formatMonths(payment.months ?? payment.month),
    clientId: payment.clientId ?? client?.clientId ?? "",
    clientName: payment.clientName ?? client?.fullNames ?? "-",
    clientPhone: payment.clientPhone ?? client?.phone ?? undefined,
    date: formatDate(payment.paymentDate ?? payment.createdAt),
    id: payment.paymentId,
    months: String(payment.months?.length ?? 1),
    receiptId: payment.receiptId ?? undefined,
    receiptNumber: payment.receiptNumber ?? "-",
    status: payment.status === "DUE" ? "Overdue" : "Paid",
    qrCodeUrl: undefined,
    verificationUrl: undefined,
  };
}

export default function ClientDetailsPanel({ clientId }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<AdminPaymentListItem | null>(null);
  const clientQuery = useAdminClientQuery(clientId);
  const paymentsQuery = useAdminClientPaymentsQuery(clientId, {
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    sortDir: "desc",
  });
  const markCompleteMutation = useMarkClientPaymentCompleteMutation(clientId);
  const client = clientQuery.data;
  const payments = paymentsQuery.data?.data ?? [];
  const totalPages = getPageCount(paymentsQuery.data?.total ?? 0, PAGE_SIZE);

  function openReceipt(payment: AdminPaymentListItem) {
    setSelectedPayment(payment);
  }

  function markComplete(payment: AdminPaymentListItem) {
    const months = payment.months ?? (payment.month ? [payment.month] : []);

    if (!months.length) {
      toast.error(t("tables.paymentTimelineMissingMonth"));
      return;
    }

    markCompleteMutation.mutate(
      { months },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => toast.success(t("tables.paymentMarkedComplete")),
      },
    );
  }

  if (clientQuery.isError) {
    return (
      <ErrorState
        message={t("dashboard.couldNotLoad")}
        reset={() => clientQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link className="flex items-center gap-3 text-text-muted" href="/clients">
        <HiOutlineArrowLeft className="size-5" />
        <div className="text-[16px] font-medium transition-colors duration-200 ease-out hover:text-foreground">
          {t("common.backToClients")}
        </div>
      </Link>

      <section className="rounded-sm border border-border bg-surface px-4 py-4 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex size-16 items-center justify-center rounded-md bg-brand text-white">
            <HiOutlineUser className="size-9" />
          </div>
          <div className="grid flex-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0">
              <p className="text-[16px] font-medium uppercase text-text-muted">
                {t("common.fullNames")}
              </p>
              <p className="break-words text-[18px] font-medium tracking-tight text-foreground">
                {clientQuery.isLoading
                  ? t("common.loading")
                  : (client?.fullNames ?? "-")}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-medium uppercase text-text-muted">
                {t("common.address")}
              </p>
              <p className="break-words text-[18px] font-medium tracking-tight text-foreground">
                {clientQuery.isLoading
                  ? t("common.loading")
                  : (client?.address ?? "-")}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-medium uppercase text-text-muted">
                {t("common.phoneNumber")}
              </p>
              <p className="break-words text-[18px] font-medium tracking-tight text-foreground">
                {clientQuery.isLoading
                  ? t("common.loading")
                  : (client?.phone ?? "-")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid max-w-2xl gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t("tables.duePayments")}
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-danger">
                {formatCurrency(client?.totalAmountDue ?? client?.totalDue)}
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
                {t("tables.dueMonths")}
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                {client?.totalMonthsDue ?? client?.dueMonths ?? 0}
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
                  t("common.month"),
                  t("common.amount"),
                  t("common.agent"),
                  t("common.receipt"),
                  t("common.status"),
                  t("tables.action"),
                ].map((header) => (
                  <TableTh
                    key={header}
                    className="px-7 py-5 text-[14px] font-semibold uppercase tracking-wider text-text-muted"
                    styles={{ th: { padding: 12 } }}
                  >
                    {header}
                  </TableTh>
                ))}
              </TableTr>
            </TableThead>
            <TableTbody>
              {paymentsQuery.isLoading || paymentsQuery.isFetching ? (
                <TableSkeletonRows columns={6} rows={PAGE_SIZE} />
              ) : payments.length === 0 ? (
                <TableEmptyRow
                  colSpan={6}
                  message={t("tables.paymentTimelineEmpty")}
                  title={t("tables.noPaymentsFound")}
                />
              ) : (
                payments.map((payment) => {
                  const isOverdue = payment.status === "DUE";

                  return (
                    <TableTr
                      key={payment.paymentId}
                      className="border-b border-border last:border-b-0"
                    >
                      <TableTd className="px-7 py-6 text-[14px] font-medium uppercase text-text-muted">
                        {formatMonths(payment.months ?? payment.month)}
                      </TableTd>
                      <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                        {formatCurrency(payment.amount)}
                      </TableTd>
                      <TableTd
                        className={`px-7 py-6 text-[14px] ${isOverdue ? "text-text-muted" : "text-foreground"}`}
                      >
                        {isOverdue ? "-" : (payment.agentName ?? "Admin")}
                      </TableTd>
                      <TableTd className="px-7 py-6 text-[14px]">
                        {isOverdue ? (
                          <span className="text-text-muted">-</span>
                        ) : (
                          <button
                            className="font-medium text-brand underline decoration-brand/40 underline-offset-4"
                            onClick={() => openReceipt(payment)}
                            type="button"
                          >
                            {t("common.view")}
                          </button>
                        )}
                      </TableTd>
                      <TableTd className="px-3 py-6">
                        <StatusBadge
                          status={
                            isOverdue ? t("common.overdue") : t("common.paid")
                          }
                        />
                      </TableTd>
                      <TableTd className="px-3 py-6 text-center">
                        {isOverdue ? (
                          <Menu position="bottom-end" shadow="md" width={180}>
                            <Menu.Target>
                              <Button
                                aria-label={`Open payment actions for ${payment.paymentId}`}
                                size="icon"
                                variant="subtle"
                              >
                                <HiEllipsisHorizontal className="size-6" />
                              </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => markComplete(payment)}>
                                {t("tables.markAsPaid")}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        ) : (
                          <Menu position="bottom-end" shadow="md" width={180}>
                            <Menu.Target>
                              <Button
                                aria-label={`Open receipt actions for ${payment.paymentId}`}
                                size="icon"
                                variant="subtle"
                              >
                                <HiEllipsisHorizontal className="size-6" />
                              </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                onClick={() => openReceipt(payment)}
                              >
                                {t("tables.viewReceipt")}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </TableTd>
                    </TableTr>
                  );
                })
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
        payment={
          selectedPayment
            ? toReceiptPayment(selectedPayment, {
                clientId: client?.clientId,
                fullNames: client?.fullNames,
                phone: client?.phone,
              })
            : null
        }
      />
    </div>
  );
}
