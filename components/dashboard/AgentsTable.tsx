"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useMemo, useState } from "react";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { agents } from "@/constants";
import type { Agent } from "@/types";

const PAGE_SIZE = 8;

function filterAgents(data: Agent[], query: string) {
  if (!query) return data;

  const normalizedQuery = query.toLowerCase();

  return data.filter((agent) =>
    [agent.name, agent.phone, agent.status, agent.region]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export default function AgentsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filteredAgents = useMemo(() => filterAgents(agents, query), [query]);
  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedAgents = filteredAgents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <FilterToolbar
      title="All Agents"
        addLabel="+ Add Agent"
        onQueryChange={setQuery}
        placeholder="Search agent...."
        query={query}
      />
      <DashboardTableShell
        headers={[
          "Full Names",
          "Phone Number",
          "Registered Date",
          "Status",
          "This Month’s Performance",
          "Action",
        ]}
        onPageChange={setPage}
        page={safePage}
        total={totalPages}
      >
        {paginatedAgents.map((agent) => (
          <TableTr key={agent.id} className="border-b border-border last:border-b-0">
            <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
              {agent.name}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {agent.phone}
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-text-muted">
              {agent.registeredDate}
            </TableTd>
            <TableTd className="px-8 py-6">
              <StatusBadge status={agent.status} />
            </TableTd>
            <TableTd className="px-8 py-6 text-[14px] text-center text-text-muted">
              {agent.performance}
            </TableTd>
            <TableTd className="px-8 py-6 text-center">
              <Menu position="bottom-end" shadow="md" width={160}>
                <Menu.Target>
                  <Button aria-label={`Open actions for ${agent.name}`} size="icon" variant="subtle">
                    <HiEllipsisHorizontal className="size-6" />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item component={Link} href={`/agents/${agent.id}`}>
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
