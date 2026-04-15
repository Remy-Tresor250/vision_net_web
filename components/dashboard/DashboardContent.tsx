"use client";

import { Popover, Skeleton } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

import ErrorState from "@/components/dashboard/ErrorState";
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

function readNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }

    if (value && typeof value === "object") {
      const objectValue = value as Record<string, unknown>;
      const nested = readNumber(objectValue, ["value", "amount", "total", "count"]);
      if (nested) return nested;
    }
  }

  return 0;
}

function buildMetricCards(kpis: Record<string, unknown> | undefined): MetricCard[] {
  const source = kpis ?? {};
  const revenue = readNumber(source, [
    "monthlyRevenue",
    "currentMonthRevenue",
    "totalRevenue",
    "revenue",
  ]);
  const pending = readNumber(source, [
    "pendingPayments",
    "pendingAmount",
    "totalDue",
    "overdueAmount",
  ]);
  const clients = readNumber(source, ["totalClients", "clients", "clientCount"]);
  const agents = readNumber(source, ["totalAgents", "agents", "agentCount"]);

  return [
    {
      id: "revenue",
      label: "This month's revenue",
      value: formatCurrency(revenue),
      caption: "Collected this month",
      tone: "brand",
    },
    {
      id: "pending",
      label: "Pending payments",
      value: formatCurrency(pending),
      caption: "Outstanding client balance",
      tone: "danger",
    },
    {
      id: "clients",
      label: "Total clients",
      value: clients.toLocaleString("en-US"),
      caption: "Registered clients",
      tone: "default",
    },
    {
      id: "agents",
      label: "Total agents",
      value: agents.toLocaleString("en-US"),
      caption: "Registered agents",
      tone: "default",
    },
  ];
}

function buildRevenueSeries(data: Array<{ month: string; amount: string; value?: number }> = []) {
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

function toMonthKey(date: Date) {
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
    null,
    null,
  ]);
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
        message="We could not load the dashboard metrics."
        reset={() => dashboardQuery.refetch()}
      />
    );
  }

  const metricCards = buildMetricCards(dashboardQuery.data?.kpis);
  const currentWindowStart = getMonthIndex(toMonthKey(minMonth));
  const currentWindowEnd = getMonthIndex(toMonthKey(maxMonth));
  const latestSixRevenueSeries = allRevenueSeries.filter((point) => {
    const index = getMonthIndex(point.month);
    return index >= currentWindowStart && index <= currentWindowEnd;
  });
  const [rangeStart, rangeEnd] = monthRange;
  const normalizedEnd =
    rangeStart && rangeEnd && getMonthIndex(toMonthKey(rangeEnd)) - getMonthIndex(toMonthKey(rangeStart)) > 1
      ? addMonths(rangeStart, 1)
      : rangeEnd;
  const revenueSeries =
    rangeStart && normalizedEnd
      ? latestSixRevenueSeries.filter((point) => {
          const index = getMonthIndex(point.month);
          return (
            index >= getMonthIndex(toMonthKey(rangeStart)) &&
            index <= getMonthIndex(toMonthKey(normalizedEnd))
          );
        })
      : latestSixRevenueSeries;
  const topAgents =
    dashboardQuery.data?.tables?.topAgents.map((agent) => ({
      amount: formatCurrency(agent.amount),
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
      status: payment.status === "DUE" ? "Overdue" as const : "Paid" as const,
    })) ?? [];

  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-4">
        {dashboardQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                className="h-36 rounded-sm border border-border bg-surface"
                key={index}
              />
            ))
          : metricCards.map((card) => <StatCard key={card.id} card={card} />)}
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
              <Popover position="bottom-end" shadow="md" width={320}>
                <Popover.Target>
                  <button className="flex flex-row items-center gap-[3px] rounded-[6px] border-[1px] border-solid border-[#E2E8E4] bg-[#F8FAF9] px-[10px] py-[8px]">
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
                        const next = value as [Date | null, Date | null];

                        if (next[0] && next[1]) {
                          const distance =
                            getMonthIndex(toMonthKey(next[1])) -
                            getMonthIndex(toMonthKey(next[0]));

                          setMonthRange([
                            next[0],
                            distance > 1 ? addMonths(next[0], 1) : next[1],
                          ]);
                          return;
                        }

                        setMonthRange(next);
                      }}
                      type="range"
                      value={monthRange}
                      valueFormat="MMM YYYY"
                    />
                    <button
                      className="text-[13px] font-medium text-brand"
                      onClick={() => {
                        setMonthRange([null, null]);
                      }}
                      type="button"
                    >
                      {t("actions.showLatestMonths")}
                    </button>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
            {dashboardQuery.isLoading ? (
              <Skeleton className="mt-4 h-64 rounded-sm" />
            ) : (
              <RevenueChart data={revenueSeries} />
            )}
          </article>
          {paymentsQuery.isLoading ? (
            <Skeleton className="h-72 rounded-sm border border-border bg-surface" />
          ) : (
            <RecentTransactionsCard transactions={recentTransactions} />
          )}
        </div>
        {dashboardQuery.isLoading ? (
          <Skeleton className="h-96 rounded-sm border border-border bg-surface xl:col-span-4" />
        ) : (
          <TopAgentsCard agents={topAgents} className="xl:col-span-4" />
        )}
      </section>
    </div>
  );
}
