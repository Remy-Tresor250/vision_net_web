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
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  className?: string;
}

export default function RecentTransactionsCard({
  className,
  transactions,
}: Props) {
  const { t } = useTranslation();

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
        <button className="text-base font-semibold text-brand">
          <p className="text-[13px]">{t("dashboard.viewAll")}</p>
        </button>
      </div>
      {transactions.length ? (
        <TableScrollContainer minWidth={760}>
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
