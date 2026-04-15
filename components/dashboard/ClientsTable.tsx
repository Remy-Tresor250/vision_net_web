"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";
import toast from "react-hot-toast";

import AddClientModal from "@/components/dashboard/AddClientModal";
import Button from "@/components/ui/Button";
import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import StatusBadge from "@/components/ui/StatusBadge";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, getPageCount } from "@/lib/format";
import {
  useAdminClientsQuery,
  useUpdateClientStatusMutation,
} from "@/lib/query/hooks";

const PAGE_SIZE = 8;

export default function ClientsTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpened, setAddOpened] = useState(false);
  const skip = (page - 1) * PAGE_SIZE;
  const clientsQuery = useAdminClientsQuery({
    limit: PAGE_SIZE,
    search: query || undefined,
    skip,
    sortDir: "desc",
  });
  const statusMutation = useUpdateClientStatusMutation("");

  const clients = clientsQuery.data?.data ?? [];
  const totalPages = getPageCount(clientsQuery.data?.total ?? 0, PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateStatus(clientId: string, isActive: boolean) {
    statusMutation.mutate(
      { clientId, isActive },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => toast.success(isActive ? "Client activated." : "Client deactivated."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        title="All Clients"
        addLabel="+ Add Client"
        onAdd={() => setAddOpened(true)}
        onQueryChange={handleQueryChange}
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
        page={page}
        total={totalPages}
      >
        {clientsQuery.isLoading
          ? <TableSkeletonRows columns={7} rows={PAGE_SIZE} />
          : clients.length === 0
          ? (
              <TableEmptyRow
                colSpan={7}
                message="Create one client or import a CSV/XLSX file to populate this table."
                title="No clients found"
              />
            )
          : clients.map((client) => (
              <TableTr
                key={client.clientId}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                  {client.fullNames}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {client.phone}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {client.address}
                </TableTd>
                <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                  {formatDate(client.registeredDate)}
                </TableTd>
                <TableTd className="px-8 py-6">
                  <StatusBadge status={client.isActive ? "Active" : "Inactive"} />
                </TableTd>
                <TableTd className="px-8 py-6 text-center text-[14px] text-text-muted">
                  {formatCurrency(client.subscriptionAmount)}
                </TableTd>
                <TableTd className="px-8 py-6 text-center">
                  <Menu position="bottom-end" shadow="md" width={160}>
                    <Menu.Target>
                      <Button
                        aria-label={`Open actions for ${client.fullNames}`}
                        size="icon"
                        variant="subtle"
                      >
                        <HiEllipsisHorizontal className="size-6" />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item component={Link} href={`/clients/${client.clientId}`}>
                        View
                      </Menu.Item>
                      <Menu.Item
                        color={client.isActive ? "red" : "green"}
                        onClick={() => updateStatus(client.clientId, !client.isActive)}
                      >
                        {client.isActive ? "Deactivate" : "Activate"}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </TableTd>
              </TableTr>
            ))}
      </DashboardTableShell>
      <AddClientModal onClose={() => setAddOpened(false)} opened={addOpened} />
    </div>
  );
}
