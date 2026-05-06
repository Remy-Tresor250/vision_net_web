"use client";

import {
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTr,
} from "@mantine/core";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import NoDataCard from "@/components/dashboard/NoDataCard";
import MobileDataCard from "@/components/dashboard/MobileDataCard";
import type { Transaction } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  transactions: Transaction[];
  className?: string;
}

export default function RecentTransactionsCard({
  className,
  transactions,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-sm border border-border bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-2">
        <h2 className="text-[14px] font-semibold uppercase tracking-wider text-foreground">
          {t("dashboard.recentTransactions")}
        </h2>
        <button onClick={() => router.push("/payments")} className="text-base font-semibold text-brand">
          <p className="text-[13px]">{t("dashboard.viewAll")}</p>
        </button>
      </div>
      {transactions.length ? (
        <>
          <div className="grid gap-3 p-3 md:hidden">
            {transactions.map((transaction) => (
              <MobileDataCard
                items={[
                  { label: t("common.date"), value: transaction.date },
                  { label: t("common.agent"), value: transaction.agentName },
                  { label: t("common.month"), value: transaction.billingCycle },
                  { label: t("common.amount"), value: transaction.amount },
                ]}
                key={transaction.id}
                title={transaction.clientName}
              />
            ))}
          </div>
          <TableScrollContainer className="hidden md:block" minWidth={760}>
          <Table className="min-w-full">
            <TableTbody>
              {transactions.map((transaction) => (
                <TableTr
                  key={transaction.id}
                  className="border-b border-border last:border-b-0"
                >
                  <TableTd className="px-5 py-3 text-[14px] text-text-muted">
                    {transaction.date}
                  </TableTd>
                  <TableTd className="px-5 py-3 text-[14px] font-medium text-foreground">
                    {transaction.clientName}
                  </TableTd>
                  <TableTd className="px-5 py-3 text-[14px] text-text-muted">
                    {transaction.agentName}
                  </TableTd>
                  <TableTd className="px-5 py-3 text-[14px] text-text-muted">
                    {transaction.billingCycle}
                  </TableTd>
                  <TableTd className="px-5 py-3 text-right text-[14px] text-text-muted">
                    {transaction.amount}
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
          </TableScrollContainer>
        </>
      ) : (
        <NoDataCard
          className="min-h-56 border-0"
          message={t("dashboard.transactionsEmpty")}
          title={t("dashboard.noTransactions")}
        />
      )}
    </section>
  );
}
