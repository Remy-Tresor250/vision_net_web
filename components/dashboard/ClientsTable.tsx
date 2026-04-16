"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [addOpened, setAddOpened] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
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
  const editingClient =
    clients.find((client) => client.clientId === editingClientId) ?? null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateStatus(clientId: string, isActive: boolean) {
    statusMutation.mutate(
      { clientId, isActive },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () =>
          toast.success(
            isActive ? t("tables.clientActivated") : t("tables.clientDeactivated"),
          ),
      },
    );
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        title={t("tables.allClients")}
        addLabel={t("actions.addClient")}
        onAdd={() => setAddOpened(true)}
        onQueryChange={handleQueryChange}
        placeholder={t("tables.searchClients")}
        query={query}
      />
      <DashboardTableShell
        headers={[
          t("common.client"),
          t("common.phone"),
          t("common.address"),
          t("common.registeredDate"),
          t("common.status"),
          t("common.subscription"),
          t("tables.action"),
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
                message={t("tables.createClientEmpty")}
                title={t("tables.noClientsFound")}
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
                  <StatusBadge
                    status={client.isActive ? t("common.active") : t("common.inactive")}
                  />
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
                        {t("common.view")}
                      </Menu.Item>
                      <Menu.Item onClick={() => setEditingClientId(client.clientId)}>
                        {t("forms.editClientTitle")}
                      </Menu.Item>
                      <Menu.Item
                        color={client.isActive ? "red" : "green"}
                        onClick={() => updateStatus(client.clientId, !client.isActive)}
                      >
                        {client.isActive ? t("tables.deactivate") : t("tables.activate")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </TableTd>
              </TableTr>
            ))}
      </DashboardTableShell>
      <AddClientModal onClose={() => setAddOpened(false)} opened={addOpened} />
      <AddClientModal
        client={editingClient}
        onClose={() => setEditingClientId(null)}
        opened={editingClient !== null}
      />
    </div>
  );
}
