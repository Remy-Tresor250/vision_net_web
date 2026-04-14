"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useMemo, useState } from "react";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import Button from "@/components/ui/Button";
import { payments } from "@/constants";
import type { Payment } from "@/types";

const PAGE_SIZE = 8;

function filterPayments(data: Payment[], query: string) {
  if (!query) return data;

  const normalizedQuery = query.toLowerCase();

  return data.filter((payment) =>
    [payment.clientName, payment.agentName, payment.date, payment.amount]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export default function PaymentsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filteredPayments = useMemo(() => filterPayments(payments, query), [query]);
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedPayments = filteredPayments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <FilterToolbar
      title="All Payments"
        onQueryChange={setQuery}
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
          "Details",
        ]}
        onPageChange={setPage}
        page={safePage}
        total={totalPages}
      >
        {paginatedPayments.map((payment) => (
          <TableTr key={payment.id} className="border-b border-border last:border-b-0">
            <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
              {payment.clientName}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {payment.agentName}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {payment.months}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {payment.date}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {payment.amount}
            </TableTd>
            <TableTd className="px-8 py-6 text-center">
              <Menu position="bottom-end" shadow="md" width={190}>
                <Menu.Target>
                  <Button
                    aria-label={`Open details for ${payment.clientName}`}
                    size="icon"
                    variant="subtle"
                  >
                    <HiEllipsisHorizontal className="size-6" />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item component={Link} href={`/clients/${payment.clientId}`}>
                    View
                  </Menu.Item>
                  <Menu.Item color="red">Mark as Invalid</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </TableTd>
          </TableTr>
        ))}
      </DashboardTableShell>
    </div>
  );
}
