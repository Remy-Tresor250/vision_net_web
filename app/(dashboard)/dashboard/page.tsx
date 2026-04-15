import type { Metadata } from "next";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatCard from "@/components/dashboard/StatCard";
import TopAgentsCard from "@/components/dashboard/TopAgentsCard";
import Button from "@/components/ui/Button";
import { metricCards, revenueSeries, topAgents, transactions } from "@/constants";

export const metadata: Metadata = {
  title: "Dashboard | Vision Net",
  description: "Overview of Vision Net admin metrics.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                  Monthly Revenue
                </h2>
              </div>
              <Button variant="outline">
                <HiOutlineAdjustmentsHorizontal className="size-5" />
                Filter
              </Button>
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
