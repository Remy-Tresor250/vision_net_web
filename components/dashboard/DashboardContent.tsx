"use client";

import { Popover, Skeleton } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

import ErrorState from "@/components/dashboard/ErrorState";
import {
  RecentTransactionsSkeleton,
  RevenueChartSkeleton,
  TopAgentsSkeleton,
} from "@/components/dashboard/DashboardPanelSkeleton";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatCard from "@/components/dashboard/StatCard";
import TopAgentsCard from "@/components/dashboard/TopAgentsCard";
import { formatCurrency, formatDate, formatMonths } from "@/lib/format";
import {
  useAdminDashboardQuery,
  useAdminPaymentsQuery,
} from "@/lib/query/hooks";
import type { MetricCard, RevenuePoint } from "@/types";

function buildMetricCards(
  kpis:
    | {
        currentMonthRevenue?: {
          amount: string;
          contributingClients?: number;
          percentIncreaseVsLastMonth?: number;
        };
        totalPendingDue?: {
          amount: string;
          clients?: number;
        };
        totalClientsActive?: {
          count: number;
          percentIncreaseVsLastMonth?: number;
        };
        totalAgentsActive?: {
          count: number;
          percentIncreaseVsLastMonth?: number;
        };
      }
    | undefined,
  locale: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): MetricCard[] {
  const revenueAmount = kpis?.currentMonthRevenue?.amount ?? "0";
  const revenueClients = kpis?.currentMonthRevenue?.contributingClients ?? 0;
  const revenueTrend = kpis?.currentMonthRevenue?.percentIncreaseVsLastMonth ?? 0;
  const pendingAmount = kpis?.totalPendingDue?.amount ?? "0";
  const pendingClients = kpis?.totalPendingDue?.clients ?? 0;
  const totalClients = kpis?.totalClientsActive?.count ?? 0;
  const clientsTrend = kpis?.totalClientsActive?.percentIncreaseVsLastMonth ?? 0;
  const totalAgents = kpis?.totalAgentsActive?.count ?? 0;
  const agentsTrend = kpis?.totalAgentsActive?.percentIncreaseVsLastMonth;

  function formatCount(value: number) {
    return value.toLocaleString(locale);
  }

  function formatTrend(value: number | undefined) {
    if (typeof value !== "number") return undefined;

    const sign = value > 0 ? "+" : "";
    return t("dashboard.vsLastMonth", {
      value: `${sign}${value}%`,
    });
  }

  return [
    {
      id: "revenue",
      label: t("dashboard.thisMonthsRevenue"),
      value: formatCurrency(revenueAmount),
      caption: t("dashboard.basedOnActiveClients", {
        count: formatCount(revenueClients),
      }),
      trend: formatTrend(revenueTrend),
      tone: "brand",
    },
    {
      id: "pending",
      label: t("dashboard.pendingPayments"),
      value: formatCurrency(pendingAmount),
      caption: t("dashboard.clientsUnpaid", {
        count: formatCount(pendingClients),
      }),
      tone: "danger",
    },
    {
      id: "clients",
      label: t("dashboard.totalClients"),
      value: formatCount(totalClients),
      caption: t("dashboard.registeredClients"),
      trend: formatTrend(clientsTrend),
      tone: "default",
    },
    {
      id: "agents",
      label: t("dashboard.totalAgents"),
      value: formatCount(totalAgents),
      caption: t("dashboard.allAgentsActiveToday"),
      trend: formatTrend(agentsTrend),
      tone: "default",
    },
  ];
}

function buildRevenueSeries(
  data: Array<{ month: string; amount: string; value?: number }> = [],
) {
  const palette = [
    "var(--color-brand-dark)",
    "var(--color-warning)",
    "var(--color-brand-dark)",
    "var(--color-brand)",
  ];

  return data.map<RevenuePoint>((item, index) => {
    const value =
      item.value ?? Number(String(item.amount).replace(/[^0-9.-]/g, "")) ?? 0;

    return {
      fill: palette[index % palette.length],
      month: item.month,
      value,
    };
  });
}

function getMonthIndex(month: string) {
  const [year, monthNumber] = month.split("-");
  const parsedYear = Number(year);
  const parsedMonth = Number(monthNumber);

  if (Number.isNaN(parsedYear) || Number.isNaN(parsedMonth)) return 0;

  return parsedYear * 12 + parsedMonth;
}

function normalizeMonthDate(value: Date | string | null | undefined) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfMonth(value);
  }

  if (typeof value === "string") {
    const [year, month] = value.split("-");
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (Number.isNaN(parsedYear) || Number.isNaN(parsedMonth)) return null;

    return new Date(parsedYear, parsedMonth - 1, 1);
  }

  return null;
}

function toMonthKey(value: Date | string) {
  const date = normalizeMonthDate(value);

  if (!date) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export default function DashboardContent() {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const maxMonth = startOfMonth(now);
  const minMonth = addMonths(maxMonth, -5);
  const [monthRange, setMonthRange] = useState<[Date | null, Date | null]>([
    minMonth,
    maxMonth,
  ]);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const dashboardQuery = useAdminDashboardQuery({
    topAgentsLimit: 10,
    year: new Date().getFullYear(),
  });
  const paymentsQuery = useAdminPaymentsQuery({
    limit: 6,
    skip: 0,
    sortDir: "desc",
  });

  const allRevenueSeries = useMemo(
    () => buildRevenueSeries(dashboardQuery.data?.graphs?.revenuePerMonth),
    [dashboardQuery.data?.graphs?.revenuePerMonth],
  );

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        message={t("dashboard.couldNotLoad")}
        reset={() => dashboardQuery.refetch()}
      />
    );
  }

  const metricCards = buildMetricCards(
    dashboardQuery.data?.kpis,
    i18n.language === "fr" ? "fr-FR" : "en-US",
    t,
  );
  const currentWindowStart = getMonthIndex(toMonthKey(minMonth));
  const currentWindowEnd = getMonthIndex(toMonthKey(maxMonth));
  const latestSixRevenueSeries = allRevenueSeries.filter((point) => {
    const index = getMonthIndex(point.month);
    return index >= currentWindowStart && index <= currentWindowEnd;
  });
  const [rangeStart, rangeEnd] = monthRange;
  const revenueSeries =
    rangeStart && rangeEnd
      ? latestSixRevenueSeries.filter((point) => {
          const index = getMonthIndex(point.month);
          return (
            index >= getMonthIndex(toMonthKey(rangeStart)) &&
            index <= getMonthIndex(toMonthKey(rangeEnd))
          );
        })
      : latestSixRevenueSeries;
  const topAgents =
    dashboardQuery.data?.tables?.topAgents.map((agent) => ({
      amount: formatCurrency(agent.amountCollected),
      id: agent.agentId,
      name: agent.fullNames,
    })) ?? [];
  const recentTransactions =
    paymentsQuery.data?.data.map((payment) => ({
      agentName: payment.agentName ?? "Admin",
      amount: formatCurrency(payment.amount),
      billingCycle: formatMonths(payment.months ?? payment.month),
      clientId: payment.clientId,
      clientName: payment.clientName ?? "-",
      date: formatDate(payment.paymentDate ?? payment.createdAt),
      id: payment.paymentId,
      status:
        payment.status === "DUE"
          ? (t("common.overdue") as "Overdue")
          : (t("common.paid") as "Paid"),
    })) ?? [];

  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-4">
        {dashboardQuery.isLoading && !dashboardQuery.data
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                className="h-36 rounded-sm border border-border bg-surface"
                key={index}
              />
            ))
          : metricCards.map((card) => <StatCard key={card.id} card={card} className="flex flex-col flex-1 justify-between" />)}
      </section>
      <section className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <article className="rounded-sm border border-border bg-surface px-5 py-2 shadow-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("dashboard.monthlyRevenue")}
                </h2>
              </div>
              <Popover
                position="bottom-end"
                shadow="md"
                width={320}
                opened={popoverOpened}
                onChange={setPopoverOpened}
                closeOnClickOutside={false}
              >
                <Popover.Target>
                  <button
                    onClick={() => setPopoverOpened((prev) => !prev)}
                    className="flex flex-row items-center gap-[3px] rounded-[6px] border-[1px] border-solid border-[#E2E8E4] bg-[#F8FAF9] px-[10px] py-[8px]"
                  >
                    <HiOutlineAdjustmentsHorizontal
                      className="size-5"
                      color="#6B7C72"
                    />
                    <p className="text-[14px]">{t("actions.filter")}</p>
                  </button>
                </Popover.Target>
                <Popover.Dropdown>
                  <div className="space-y-3">
                    <p className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
                      {t("dashboard.range")}
                    </p>
                    <MonthPickerInput
                      clearable
                      locale={i18n.language}
                      maxDate={maxMonth}
                      minDate={minMonth}
                      onChange={(value) => {
                        const [startValue, endValue] = (value ??
                          []) as [Date | string | null, Date | string | null];
                        const nextStart = normalizeMonthDate(startValue);
                        const nextEnd = normalizeMonthDate(endValue);

                        if (nextStart && !nextEnd) {
                          setMonthRange([nextStart, null]);
                          return;
                        }

                        if (nextStart && nextEnd) {
                          const normalizedRange: [Date, Date] =
                            getMonthIndex(toMonthKey(nextStart)) <=
                              getMonthIndex(toMonthKey(nextEnd))
                              ? [nextStart, nextEnd]
                              : [nextEnd, nextStart];

                          setMonthRange(normalizedRange);
                          setPopoverOpened(false);
                          return;
                        }

                        setMonthRange([null, null]);
                      }}
                      styles={{
                        input: {
                          color: "#000",
                        },
                      }}
                      type="range"
                      value={monthRange}
                      valueFormat="MMM YYYY"
                    />
                    <button
                      className="px-[10px] py-[8px] bg-transparent border-gray-500 border-[1px] border-solid rounded-[6px]"
                      onClick={() => {
                        setMonthRange([minMonth, maxMonth]);
                      }}
                      type="button"
                    >
                      <p className="text-[13px] text-brand font-medium">
                        {" "}
                        {t("actions.showLatestMonths")}
                      </p>
                    </button>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
            {dashboardQuery.isLoading ? (
              <RevenueChartSkeleton />
            ) : (
              <RevenueChart data={revenueSeries} />
            )}
          </article>
          {paymentsQuery.isLoading ? (
            <RecentTransactionsSkeleton />
          ) : (
            <RecentTransactionsCard transactions={recentTransactions} />
          )}
        </div>
        {dashboardQuery.isLoading ? (
          <TopAgentsSkeleton className="xl:col-span-4" />
        ) : (
          <TopAgentsCard agents={topAgents} className="xl:col-span-4" />
        )}
      </section>
    </div>
  );
}
