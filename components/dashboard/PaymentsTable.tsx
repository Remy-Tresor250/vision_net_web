"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate, formatMonths, getPageCount } from "@/lib/format";
import { useAdminPaymentsQuery } from "@/lib/query/hooks";

const PAGE_SIZE = 8;

export default function PaymentsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const paymentsQuery = useAdminPaymentsQuery({
    limit: PAGE_SIZE,
    search: query || undefined,
    skip: (page - 1) * PAGE_SIZE,
    sortDir: "desc",
  });
  const payments = paymentsQuery.data?.data ?? [];
  const totalPages = getPageCount(paymentsQuery.data?.total ?? 0, PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        title="All Payments"
        onQueryChange={handleQueryChange}
        placeholder="Search Client, Agent ...."
        query={query}
      />
      <DashboardTableShell
        headers={[
          "Client Names",
          "Agent Name",
          "Month(s)",
          "Date",
          "Amount",
          "Status",
          "Details",
        ]}
        onPageChange={setPage}
        page={page}
        total={totalPages}
      >
        {paymentsQuery.isLoading
          ? <TableSkeletonRows columns={7} rows={PAGE_SIZE} />
          : payments.length === 0
          ? (
              <TableEmptyRow
                colSpan={7}
                message="Payment records will appear here after agents or admins confirm collections."
                title="No payments found"
              />
            )
          : payments.map((payment) => (
              <TableTr
                key={payment.paymentId}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                  {payment.clientName ?? "-"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {payment.agentName ?? "Admin"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatMonths(payment.months ?? payment.month)}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatDate(payment.paymentDate ?? payment.createdAt)}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatCurrency(payment.amount)}
                </TableTd>
                <TableTd className="px-8 py-6">
                  <StatusBadge status={payment.status === "DUE" ? "Overdue" : "Paid"} />
                </TableTd>
                <TableTd className="px-8 py-6 text-center">
                  <Menu position="bottom-end" shadow="md" width={190}>
                    <Menu.Target>
                      <Button
                        aria-label={`Open details for ${payment.clientName ?? "payment"}`}
                        size="icon"
                        variant="subtle"
                      >
                        <HiEllipsisHorizontal className="size-6" />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {payment.clientId ? (
                        <Menu.Item component={Link} href={`/clients/${payment.clientId}`}>
                          View client
                        </Menu.Item>
                      ) : null}
                      {payment.agentId ? (
                        <Menu.Item component={Link} href={`/agents/${payment.agentId}`}>
                          View agent
                        </Menu.Item>
                      ) : null}
                    </Menu.Dropdown>
                  </Menu>
                </TableTd>
              </TableTr>
            ))}
      </DashboardTableShell>
    </div>
  );
}
