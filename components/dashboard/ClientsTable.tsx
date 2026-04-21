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
import type { AdminClientsParams } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDate, getPageCount } from "@/lib/format";
import {
  useAdminClientsQuery,
  useUpdateClientStatusMutation,
} from "@/lib/query/hooks";

const PAGE_SIZE = 8;

function formatClientLocation(client: {
  avenueName?: string | null;
  quartierName?: string | null;
  serineName?: string | null;
}) {
  const parts = [client.quartierName, client.serineName, client.avenueName].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

export default function ClientsTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    createdAtFrom: "",
    createdAtTo: "",
    isActive: "",
    is_due: "",
    registeredDateFrom: "",
    registeredDateTo: "",
    sortBy: "",
    sortDir: "desc",
  });
  const [addOpened, setAddOpened] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const skip = (page - 1) * PAGE_SIZE;
  const clientParams: AdminClientsParams = {
    createdAtFrom: filters.createdAtFrom || undefined,
    createdAtTo: filters.createdAtTo || undefined,
    isActive:
      filters.isActive === "true"
        ? true
        : filters.isActive === "false"
          ? false
          : undefined,
    is_due:
      filters.is_due === "true"
        ? true
        : filters.is_due === "false"
          ? false
          : undefined,
    limit: PAGE_SIZE,
    registeredDateFrom: filters.registeredDateFrom || undefined,
    registeredDateTo: filters.registeredDateTo || undefined,
    search: query || undefined,
    skip,
    sortBy: filters.sortBy || undefined,
    sortDir: (filters.sortDir as "asc" | "desc") || undefined,
  };
  const clientsQuery = useAdminClientsQuery(clientParams);
  const statusMutation = useUpdateClientStatusMutation("");

  const clients = clientsQuery.data?.data ?? [];
  const totalPages = getPageCount(clientsQuery.data?.total ?? 0, PAGE_SIZE);
  const editingClient =
    clients.find((client) => client.clientId === editingClientId) ?? null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(value: Record<string, string>) {
    setFilters(value);
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
        filterFields={[
          {
            id: "isActive",
            label: t("filters.activeStatus"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("common.active"), value: "true" },
              { label: t("common.inactive"), value: "false" },
            ],
            type: "select",
          },
          {
            id: "is_due",
            label: t("filters.dueStatus"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("filters.overdueOnly"), value: "true" },
              { label: t("filters.notDueOnly"), value: "false" },
            ],
            type: "select",
          },
          { id: "registeredDateFrom", label: t("filters.registeredDateFrom"), type: "date" },
          { id: "registeredDateTo", label: t("filters.registeredDateTo"), type: "date" },
          { id: "createdAtFrom", label: t("filters.createdAtFrom"), type: "date" },
          { id: "createdAtTo", label: t("filters.createdAtTo"), type: "date" },
          {
            id: "sortBy",
            label: t("filters.sortBy"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("common.registeredDate"), value: "registeredDate" },
              { label: t("common.fullNames"), value: "fullNames" },
              { label: t("common.phone"), value: "phone" },
              { label: t("filters.createdAtFrom"), value: "createdAt" },
            ],
            type: "select",
          },
          {
            id: "sortDir",
            label: t("filters.sortDir"),
            options: [
              { label: t("common.all"), value: "" },
              { label: "ASC", value: "asc" },
              { label: "DESC", value: "desc" },
            ],
            type: "select",
          },
        ]}
        filters={filters}
        onAdd={() => setAddOpened(true)}
        onFiltersChange={handleFiltersChange}
        onQueryChange={handleQueryChange}
        placeholder={t("tables.searchClients")}
        query={query}
      />
      <DashboardTableShell
        headers={[
          t("common.client"),
          t("common.code"),
          t("common.phone"),
          t("common.location"),
          t("common.registeredDate"),
          t("common.status"),
          t("common.service"),
          t("tables.action"),
        ]}
        onPageChange={setPage}
        page={page}
        total={totalPages}
      >
        {clientsQuery.isLoading || clientsQuery.isFetching
          ? <TableSkeletonRows columns={8} rows={PAGE_SIZE} />
          : clients.length === 0
          ? (
              <TableEmptyRow
                colSpan={8}
                message={t("tables.createClientEmpty")}
                title={t("tables.noClientsFound")}
              />
            )
          : clients.map((client) => (
              <TableTr
                key={client.clientId}
                className="border-b border-border last:border-b-0"
              >
                <TableTd className="px-8 py-6 text-[12px] font-medium text-foreground">
                  {client.fullNames}
                </TableTd>
                <TableTd className="px-8 py-6 text-[12px] text-text-muted">
                  {client.code?.trim() ? client.code : "-"}
                </TableTd>
                <TableTd className="px-8 py-6 text-[12px] text-text-muted">
                  {client.phone}
                </TableTd>
                <TableTd className="px-8 py-6 text-[12px] text-text-muted">
                  {formatClientLocation(client)}
                </TableTd>
                <TableTd className="px-8 py-6 text-[12px] text-center text-text-muted">
                  {formatDate(client.registeredDate)}
                </TableTd>
                <TableTd className="px-8 py-6">
                  <StatusBadge
                    status={client.isActive ? t("common.active") : t("common.inactive")}
                  />
                </TableTd>
                <TableTd className="px-8 py-6 text-center text-[12px] text-text-muted">
                  {client.serviceTypeName ?? "-"}
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
