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
import MobileInfiniteLoader from "@/components/dashboard/MobileInfiniteLoader";
import NoDataCard from "@/components/dashboard/NoDataCard";
import MobileDataCard from "@/components/dashboard/MobileDataCard";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import StatusBadge from "@/components/ui/StatusBadge";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, formatMonths } from "@/lib/format";
import { getAdminPaymentId, getPaymentActorName } from "@/lib/payment";
import {
  useAdminClientPaymentsQuery,
  useAdminClientQuery,
  useMarkClientPaymentCompleteMutation,
} from "@/lib/query/hooks";
import { useMobileAccumulatedList } from "@/lib/query/useMobileAccumulatedList";
import type { AdminPaymentListItem } from "@/lib/api/types";
import { getPageCount } from "@/lib/format";
import type { Payment } from "@/types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  clientId: string;
}

const PAGE_SIZE = 7;

function formatClientLocation(client: {
  avenueName?: string | null;
  quartierName?: string | null;
  serineName?: string | null;
}) {
  const parts = [client.quartierName, client.serineName, client.avenueName].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

function toReceiptPayment(
  payment: AdminPaymentListItem,
  client?: { clientId?: string; fullNames?: string; phone?: string },
): Payment {
  const paymentId = getAdminPaymentId(payment);

  return {
    agentId: payment.agentId ?? "admin",
    agentName: getPaymentActorName(payment),
    amount: formatCurrency(payment.amount),
    billingMonth: formatMonths(payment.months ?? payment.month),
    clientId: payment.clientId ?? client?.clientId ?? "",
    clientName: payment.clientName ?? client?.fullNames ?? "-",
    clientPhone: payment.clientPhone ?? client?.phone ?? undefined,
    date: formatDate(payment.paymentDate ?? payment.createdAt),
    id: paymentId,
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
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canViewPayments = hasAnyPermission(permissions, ["payments.view"]);
  const canEditPayments = hasAnyPermission(permissions, ["payments.edit"]);
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<AdminPaymentListItem | null>(null);
  const clientQuery = useAdminClientQuery(clientId);
  const paymentsQuery = useAdminClientPaymentsQuery(
    clientId,
    {
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      sortDir: "desc",
    },
    { enabled: canViewPayments },
  );
  const markCompleteMutation = useMarkClientPaymentCompleteMutation(clientId);
  const client = clientQuery.data;
  const payments = paymentsQuery.data?.data ?? [];
  const { mobileItems: mobilePayments } = useMobileAccumulatedList({
    getKey: (payment) => getAdminPaymentId(payment) || payment.receiptId || payment.createdAt || "",
    isPlaceholderData: paymentsQuery.isPlaceholderData,
    items: payments,
    page,
    resetKey: clientId,
  });
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

  function loadMore() {
    if (page < totalPages && !paymentsQuery.isFetching) {
      setPage((current) => current + 1);
    }
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
                {t("common.code")}
              </p>
              <p className="break-words text-[18px] font-medium tracking-tight text-foreground">
                {clientQuery.isLoading
                  ? t("common.loading")
                  : (client?.code?.trim() || "-")}
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
            <div className="min-w-0">
              <p className="text-[16px] font-medium uppercase text-text-muted">
                {t("common.location")}
              </p>
              <p className="break-words text-[18px] font-medium tracking-tight text-foreground">
                {clientQuery.isLoading
                  ? t("common.loading")
                  : formatClientLocation(client ?? {})}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid max-w-2xl gap-4 md:grid-cols-2 md:gap-6">
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

      {canViewPayments ? (
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="grid gap-3 p-3 md:hidden">
          {paymentsQuery.isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  className="h-44 animate-pulse rounded-xl border border-border bg-surface-muted"
                  key={index}
                />
              ))
            : mobilePayments.map((payment) => {
                const paymentId = getAdminPaymentId(payment);
                const isOverdue = payment.status === "DUE";

                return (
                  <MobileDataCard
                    actions={
                      isOverdue && canEditPayments ? (
                        <Button
                          className="h-9 px-3 text-xs"
                          onClick={() => markComplete(payment)}
                          variant="outline"
                        >
                          {t("tables.markAsPaid")}
                        </Button>
                      ) : !isOverdue ? (
                        <Button
                          className="h-9 px-3 text-xs"
                          onClick={() => openReceipt(payment)}
                          variant="outline"
                        >
                          {t("tables.viewReceipt")}
                        </Button>
                      ) : null
                    }
                    items={[
                      {
                        label: t("common.amount"),
                        value: formatCurrency(payment.amount),
                      },
                      {
                        label: t("common.agent"),
                        value: isOverdue ? "-" : getPaymentActorName(payment),
                      },
                      {
                        label: t("common.receipt"),
                        value: isOverdue ? "-" : t("common.view"),
                      },
                    ]}
                    key={paymentId || payment.receiptId || payment.createdAt}
                    status={
                      <StatusBadge
                        status={
                          isOverdue ? t("common.overdue") : t("common.paid")
                        }
                      />
                    }
                    title={formatMonths(payment.months ?? payment.month)}
                  />
                );
              })}
          <MobileInfiniteLoader
            hasMore={mobilePayments.length < (paymentsQuery.data?.total ?? 0)}
            isLoading={paymentsQuery.isFetching && page > 1}
            onLoadMore={loadMore}
          />
        </div>
        <TableScrollContainer className="hidden md:block" minWidth={1080}>
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
                    className="px-4 py-5 text-[14px] font-semibold uppercase tracking-wider text-text-muted"
                    styles={{ th: { padding: 12 } }}
                  >
                    {header}
                  </TableTh>
                ))}
              </TableTr>
            </TableThead>
            <TableTbody>
              {paymentsQuery.isLoading ? (
                <TableSkeletonRows columns={6} rows={PAGE_SIZE} />
              ) : payments.length === 0 ? (
                <TableEmptyRow
                  colSpan={6}
                  message={t("tables.paymentTimelineEmpty")}
                  title={t("tables.noPaymentsFound")}
                />
              ) : (
                payments.map((payment) => {
                  const paymentId = getAdminPaymentId(payment);
                  const isOverdue = payment.status === "DUE";

                  return (
                    <TableTr
                      key={paymentId || payment.receiptId || payment.createdAt}
                      className="border-b border-border last:border-b-0"
                    >
                      <TableTd className="px-3 py-6 text-[14px] font-medium uppercase text-text-muted max-w-[280px]">
                        {formatMonths(payment.months ?? payment.month)}
                      </TableTd>
                      <TableTd className="px-3 py-6 text-[14px] text-text-muted">
                        <p className="pl-[10px]">{formatCurrency(payment.amount)}</p>
                      </TableTd>
                      <TableTd
                        className={`px-3 py-6 text-[14px] ${isOverdue ? "text-text-muted" : "text-foreground"}`}
                      >
                        {isOverdue ? "-" : getPaymentActorName(payment)}
                      </TableTd>
                      <TableTd className="px-3 py-6 text-[14px]">
                        {isOverdue ? (
                          <span className="text-text-muted">-</span>
                        ) : (
                          <button
                            className="font-medium text-brand underline decoration-brand/40 underline-offset-4"
                            onClick={() => openReceipt(payment)}
                            type="button"
                          >
                            <p className="pl-[10px]">{t("common.view")}</p>
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
                      <TableTd>
                        {isOverdue && canEditPayments ? (
                          <Menu position="bottom-end" shadow="md" width={180}>
                            <Menu.Target>
                              <Button
                                aria-label={`Open payment actions for ${paymentId || "payment"}`}
                                size="icon"
                                variant="subtle"
                                className="!ml-3"
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
                        ) : !isOverdue ? (
                          <Menu position="bottom-end" shadow="md" width={180}>
                            <Menu.Target>
                              <Button
                                aria-label={`Open receipt actions for ${paymentId || "payment"}`}
                                size="icon"
                                variant="subtle"
                                className="!ml-3"
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
                        ) : (
                          <span className="px-3 text-text-muted">-</span>
                        )}
                      </TableTd>
                    </TableTr>
                  );
                })
              )}
            </TableTbody>
          </Table>
        </TableScrollContainer>
        <div className="hidden justify-center px-6 py-7 md:flex">
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
      ) : (
        <NoDataCard
          className="min-h-72"
          message={t("permissions.limitedData")}
          title={t("dashboard.allPayments")}
        />
      )}
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
