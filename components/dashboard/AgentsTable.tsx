"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";
import toast from "react-hot-toast";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import AddAgentModal from "@/components/dashboard/AddAgentModal";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, getPageCount } from "@/lib/format";
import {
  useAdminAgentsQuery,
  useUpdateAgentStatusMutation,
} from "@/lib/query/hooks";

const PAGE_SIZE = 8;

export default function AgentsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpened, setAddOpened] = useState(false);
  const skip = (page - 1) * PAGE_SIZE;
  const agentsQuery = useAdminAgentsQuery({
    limit: PAGE_SIZE,
    search: query || undefined,
    skip,
    sortDir: "desc",
  });
  const statusMutation = useUpdateAgentStatusMutation();

  const agents = agentsQuery.data?.data ?? [];
  const totalPages = getPageCount(agentsQuery.data?.total ?? 0, PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateStatus(agentId: string, isActive: boolean) {
    statusMutation.mutate(
      { agentId, isActive },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => toast.success(isActive ? "Agent activated." : "Agent deactivated."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        title="All Agents"
        addLabel="+ Add Agent"
        onAdd={() => setAddOpened(true)}
        onQueryChange={handleQueryChange}
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
        page={page}
        total={totalPages}
      >
        {agentsQuery.isLoading
          ? <TableSkeletonRows columns={6} rows={PAGE_SIZE} />
          : agents.length === 0
          ? (
              <TableEmptyRow
                colSpan={6}
                message="Create one agent or import a CSV/XLSX file to populate this table."
                title="No agents found"
              />
            )
          : agents.map((agent) => (
              <TableTr
                key={agent.agentId}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                  {agent.fullNames}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {agent.phone}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatDate(agent.createdAt)}
                </TableTd>
                <TableTd className="px-8 py-6">
                  <StatusBadge status={agent.isActive ? "Active" : "Inactive"} />
                </TableTd>
                <TableTd className="px-8 py-6 text-center text-[14px] text-text-muted">
                  {formatCurrency(agent.currentMonthCollected)}
                </TableTd>
                <TableTd className="px-8 py-6 text-center">
                  <Menu position="bottom-end" shadow="md" width={160}>
                    <Menu.Target>
                      <Button
                        aria-label={`Open actions for ${agent.fullNames}`}
                        size="icon"
                        variant="subtle"
                      >
                        <HiEllipsisHorizontal className="size-6" />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item component={Link} href={`/agents/${agent.agentId}`}>
                        View
                      </Menu.Item>
                      <Menu.Item
                        color={agent.isActive ? "red" : "green"}
                        onClick={() => updateStatus(agent.agentId, !agent.isActive)}
                      >
                        {agent.isActive ? "Deactivate" : "Activate"}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </TableTd>
              </TableTr>
            ))}
      </DashboardTableShell>
      <AddAgentModal onClose={() => setAddOpened(false)} opened={addOpened} />
    </div>
  );
}
