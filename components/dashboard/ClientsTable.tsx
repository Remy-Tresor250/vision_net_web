"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import AddClientModal from "@/components/dashboard/AddClientModal";
import Button from "@/components/ui/Button";
import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import StatusBadge from "@/components/ui/StatusBadge";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import { getClientTypeLabelKey } from "@/lib/client-type";
import type { AdminClientsParams, ClientType } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, getPageCount } from "@/lib/format";
import {
  useAdminClientsQuery,
  useUpdateClientStatusMutation,
} from "@/lib/query/hooks";

const PAGE_SIZE = 8;

interface Props {
  initialClientType: ClientType;
}

function formatClientLocation(client: {
  avenueName?: string | null;
  quartierName?: string | null;
  serineName?: string | null;
}) {
  const parts = [
    client.quartierName,
    client.serineName,
    client.avenueName,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

export default function ClientsTable({ initialClientType }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [clientType, setClientType] = useState<ClientType>(initialClientType);
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
    clientType,
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
  useEffect(() => {
    setClientType(initialClientType);
  }, [initialClientType]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(value: Record<string, string>) {
    setFilters(value);
    setPage(1);
  }

  function handleClientTypeChange(nextClientType: ClientType) {
    setClientType(nextClientType);
    setPage(1);
    setAddOpened(false);
    setEditingClientId(null);
    const params = new URLSearchParams();
    params.set("clientType", nextClientType);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function updateStatus(clientId: string, isActive: boolean) {
    statusMutation.mutate(
      { clientId, isActive },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () =>
          toast.success(
            isActive
              ? t("tables.clientActivated")
              : t("tables.clientDeactivated"),
          ),
      },
    );
  }

  function resolveClientType(client: {
    clientType?: ClientType | null;
    type?: ClientType | null;
  }) {
    return (client.clientType ?? client.type ?? clientType) as ClientType;
  }

  function formatAmount(client: {
    subscriptionAmountMinor?: number | null;
  }) {
    return typeof client.subscriptionAmountMinor === "number"
      ? formatCurrency(client.subscriptionAmountMinor / 100)
      : "-";
  }

  return (
    <div className="space-y-3">
      <FilterToolbar
        title={
          <div className="">
            <p className="text-[27px] font-medium text-[#0A3B24]">
              {t("nav.clients")}
            </p>
            <div className="inline-grid w-full max-w-[420px] grid-cols-2 rounded-[14px] bg-surface-muted p-1.5">
              {(["NORMAL", "POTENTIAL"] as const).map((value) => {
                const isActive = clientType === value;

                return (
                  <button
                    className={
                      isActive
                        ? "h-10 rounded-[12px] bg-surface text-brand shadow-card px-3 lg:px-5 py-2"
                        : "h-10 rounded-[12px] text-text-muted hover:text-foreground"
                    }
                    key={value}
                    onClick={() => handleClientTypeChange(value)}
                    type="button"
                  >
                    <p className="text-[14px] font-medium">{t(getClientTypeLabelKey(value))}</p>
                  </button>
                );
              })}
            </div>
          </div>
        }
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
          {
            id: "registeredDateFrom",
            label: t("filters.registeredDateFrom"),
            type: "date",
          },
          {
            id: "registeredDateTo",
            label: t("filters.registeredDateTo"),
            type: "date",
          },
          {
            id: "createdAtFrom",
            label: t("filters.createdAtFrom"),
            type: "date",
          },
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
        className="h-auto min-h-[32rem] md:h-[75vh]"
        headers={[
          t("common.client"),
          t("common.type"),
          t("common.amount"),
          t("common.code"),
          t("common.phone"),
          t("common.location"),
          t("common.registeredDate"),
          t("common.status"),
          t("tables.action"),
        ]}
        onPageChange={setPage}
        page={page}
        total={totalPages}
      >
        {clientsQuery.isLoading || clientsQuery.isFetching ? (
          <TableSkeletonRows columns={8} rows={PAGE_SIZE} />
        ) : clients.length === 0 ? (
          <TableEmptyRow
            colSpan={8}
            message={t("tables.createClientEmpty")}
            title={t("tables.noClientsFound")}
          />
        ) : (
          clients.map((client) => (
            <TableTr
              key={client.clientId}
              className="border-b border-border last:border-b-0"
            >
              <TableTd className="px-4 py-6 text-[12px] font-medium text-foreground">
                {client.fullNames}
              </TableTd>
              <TableTd className="px-4 py-6 text-center text-[12px] text-text-muted">
                {t(
                  getClientTypeLabelKey(
                    resolveClientType(client),
                  ),
                )}
              </TableTd>
              <TableTd className="px-4 py-6 text-center text-[12px] text-text-muted">
                {formatAmount(client)}
              </TableTd>
              <TableTd className="px-4 py-6 text-[12px] text-text-muted">
                {client.code?.trim() ? client.code : "-"}
              </TableTd>
              <TableTd className="px-4 py-6 text-[12px] text-text-muted">
                {client.phone}
              </TableTd>
              <TableTd className="px-4 py-6 text-[12px] text-text-muted">
                {formatClientLocation(client)}
              </TableTd>
              <TableTd className="px-4 py-6 text-[12px] text-center text-text-muted">
                {formatDate(client.registeredDate)}
              </TableTd>
              <TableTd className="px-4 py-6">
                <StatusBadge
                  status={
                    client.isActive ? t("common.active") : t("common.inactive")
                  }
                />
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
                    <Menu.Item
                      component={Link}
                      href={`/clients/${client.clientId}`}
                    >
                      {t("common.view")}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => setEditingClientId(client.clientId)}
                    >
                      {t("forms.editClientTitle")}
                    </Menu.Item>
                    <Menu.Item
                      color={client.isActive ? "red" : "green"}
                      onClick={() =>
                        updateStatus(client.clientId, !client.isActive)
                      }
                    >
                      {client.isActive
                        ? t("tables.deactivate")
                        : t("tables.activate")}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </TableTd>
            </TableTr>
          ))
        )}
      </DashboardTableShell>
      <AddClientModal
        defaultClientType={clientType}
        onClose={() => setAddOpened(false)}
        opened={addOpened}
      />
      <AddClientModal
        client={editingClient}
        defaultClientType={clientType}
        onClose={() => setEditingClientId(null)}
        opened={editingClient !== null}
      />
    </div>
  );
}
