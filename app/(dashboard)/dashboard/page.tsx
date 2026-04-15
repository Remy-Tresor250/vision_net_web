import type { Metadata } from "next";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatCard from "@/components/dashboard/StatCard";
import TopAgentsCard from "@/components/dashboard/TopAgentsCard";
import {
  metricCards,
  revenueSeries,
  topAgents,
  transactions,
} from "@/constants";

export const metadata: Metadata = {
  title: "Dashboard | Vision Net",
  description: "Overview of Vision Net admin metrics.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <article className="rounded-sm border border-border bg-surface px-5 py-2 shadow-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-text-muted">
                  Monthly Revenue
                </h2>
              </div>
              <button className="px-[10px] py-[8px] flex flex-row items-center border-[#E2E8E4] border-[1px] border-solid bg-[#F8FAF9] gap-[3px] rounded-[6px]">
                <HiOutlineAdjustmentsHorizontal
                  className="size-5"
                  color="#6B7C72"
                />
                <p className="text-[14px]">Filter</p>
              </button>
            </div>
            <RevenueChart data={revenueSeries} />
          </article>
          <RecentTransactionsCard transactions={transactions} />
        </div>
        <TopAgentsCard agents={topAgents} className="xl:col-span-4" />
      </section>
    </div>
  );
}
