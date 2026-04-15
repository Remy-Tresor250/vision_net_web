import {
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTr,
} from "@mantine/core";

import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  className?: string;
}

export default function RecentTransactionsCard({ className, transactions }: Props) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-4">
        <h2 className="text-lg font-semibold uppercase tracking-wider text-foreground">
          Recent Transactions
        </h2>
        <button className="text-base font-semibold text-brand">View All</button>
      </div>
      <TableScrollContainer minWidth={760}>
        <Table className="min-w-full">
          <TableTbody>
            {transactions.map((transaction) => (
              <TableTr key={transaction.id} className="border-b border-border last:border-b-0">
                <TableTd className="px-5 py-5 text-lg text-text-muted">
                  {transaction.date}
                </TableTd>
                <TableTd className="px-5 py-5 text-xl font-medium text-foreground">
                  {transaction.clientName}
                </TableTd>
                <TableTd className="px-5 py-5 text-xl text-text-muted">
                  {transaction.agentName}
                </TableTd>
                <TableTd className="px-5 py-5 text-lg text-text-muted">
                  {transaction.billingCycle}
                </TableTd>
                <TableTd className="px-5 py-5 text-right text-xl text-text-muted">
                  {transaction.amount}
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </section>
  );
}
