"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useMemo, useState } from "react";

import { clients } from "@/constants";
import type { Client } from "@/types";
import Button from "@/components/ui/Button";
import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import StatusBadge from "@/components/ui/StatusBadge";

const PAGE_SIZE = 8;

function filterClients(data: Client[], query: string) {
  if (!query) return data;

  const normalizedQuery = query.toLowerCase();

  return data.filter((client) =>
    [client.name, client.phone, client.address, client.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export default function ClientsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => filterClients(clients, query), [query]);
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedClients = filteredClients.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <FilterToolbar
      title="All Clients"
        addLabel="+ Add Client"
        onQueryChange={setQuery}
        placeholder="Search clients..."
        query={query}
      />
      <DashboardTableShell
        headers={[
          "Client",
          "Phone",
          "Address",
          "Registered Date",
          "Status",
          "Subscription",
          "Action",
        ]}
        onPageChange={setPage}
        page={safePage}
        total={totalPages}
      >
        {paginatedClients.map((client) => (
          <TableTr key={client.id} className="border-b border-border last:border-b-0">
            <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
              {client.name}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {client.phone}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {client.address}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {client.registeredDate}
            </TableTd>
            <TableTd className="px-8 py-6">
              <StatusBadge status={client.status} />
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted text-center">
              {client.subscription}
            </TableTd>
            <TableTd className="px-8 py-6 text-center">
              <Menu position="bottom-end" shadow="md" width={160}>
                <Menu.Target>
                  <Button aria-label={`Open actions for ${client.name}`} size="icon" variant="subtle">
                    <HiEllipsisHorizontal className="size-6" />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item component={Link} href={`/clients/${client.id}`}>
                    View
                  </Menu.Item>
                  <Menu.Item color="red">Disactivate</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </TableTd>
          </TableTr>
        ))}
      </DashboardTableShell>
    </div>
  );
}
