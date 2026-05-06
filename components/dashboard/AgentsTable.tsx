"use client";

import Link from "next/link";
import { Menu, TableTd, TableTr } from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import AddAgentModal from "@/components/dashboard/AddAgentModal";
import MobileDataCard from "@/components/dashboard/MobileDataCard";
import NoDataCard from "@/components/dashboard/NoDataCard";
import PasswordCell from "@/components/dashboard/PasswordCell";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { hasAnyPermission } from "@/lib/auth/permissions";
import type { AdminAgentsParams } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, getPageCount } from "@/lib/format";
import {
  useAdminAgentsQuery,
  useResetUserPasswordMutation,
  useUpdateAgentStatusMutation,
} from "@/lib/query/hooks";
import { useMobileAccumulatedList } from "@/lib/query/useMobileAccumulatedList";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 8;

export default function AgentsTable() {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canCreateAgents = hasAnyPermission(permissions, ["agents.create"]);
  const canEditAgents = hasAnyPermission(permissions, ["agents.edit"]);
  const canResetPasswords = hasAnyPermission(permissions, ["users.password_reset"]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    createdAtFrom: "",
    createdAtTo: "",
    isActive: "",
    maxCurrentMonthCollected: "",
    minCurrentMonthCollected: "",
    sortBy: "",
    sortDir: "desc",
  });
  const [addOpened, setAddOpened] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const skip = (page - 1) * PAGE_SIZE;
  const agentParams: AdminAgentsParams = {
    createdAtFrom: filters.createdAtFrom || undefined,
    createdAtTo: filters.createdAtTo || undefined,
    isActive:
      filters.isActive === "true"
        ? true
        : filters.isActive === "false"
          ? false
          : undefined,
    limit: PAGE_SIZE,
    maxCurrentMonthCollected: filters.maxCurrentMonthCollected || undefined,
    minCurrentMonthCollected: filters.minCurrentMonthCollected || undefined,
    search: query || undefined,
    skip,
    sortBy: filters.sortBy || undefined,
    sortDir: (filters.sortDir as "asc" | "desc") || undefined,
  };
  const agentsQuery = useAdminAgentsQuery(agentParams);
  const statusMutation = useUpdateAgentStatusMutation();
  const resetPasswordMutation = useResetUserPasswordMutation();

  const agents = agentsQuery.data?.data ?? [];
  const totalPages = getPageCount(agentsQuery.data?.total ?? 0, PAGE_SIZE);
  const mobileResetKey = JSON.stringify({ filters, query });
  const { mobileItems: mobileAgents } = useMobileAccumulatedList({
    getKey: (agent) => agent.agentId,
    isPlaceholderData: agentsQuery.isPlaceholderData,
    items: agents,
    page,
    resetKey: mobileResetKey,
  });
  const editingAgent =
    agents.find((agent) => agent.agentId === editingAgentId) ?? null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function loadMore() {
    if (page < totalPages && !agentsQuery.isFetching) {
      setPage((current) => current + 1);
    }
  }

  function handleFiltersChange(value: Record<string, string>) {
    setFilters(value);
    setPage(1);
  }

  function updateStatus(agentId: string, isActive: boolean) {
    statusMutation.mutate(
      { agentId, isActive },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () =>
          toast.success(
            isActive
              ? t("tables.agentActivated")
              : t("tables.agentDeactivated"),
          ),
      },
    );
  }

  function resetPassword(userId: string) {
    setResettingUserId(userId);
    resetPasswordMutation.mutate(userId, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: (response) =>
        toast.success(response.message ?? t("common.passwordResetSuccess")),
      onSettled: () => setResettingUserId(null),
    });
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        title={t("tables.allAgents")}
        addLabel={t("actions.addAgent")}
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
            id: "createdAtFrom",
            label: t("filters.createdAtFrom"),
            type: "date",
          },
          { id: "createdAtTo", label: t("filters.createdAtTo"), type: "date" },
          {
            id: "minCurrentMonthCollected",
            label: t("filters.currentMonthCollectedMin"),
            type: "number",
          },
          {
            id: "maxCurrentMonthCollected",
            label: t("filters.currentMonthCollectedMax"),
            type: "number",
          },
          {
            id: "sortBy",
            label: t("filters.sortBy"),
            options: [
              { label: t("common.all"), value: "" },
              { label: t("common.registeredDate"), value: "createdAt" },
              { label: t("common.fullNames"), value: "fullNames" },
              { label: t("common.phone"), value: "phone" },
              {
                label: t("tables.performance"),
                value: "currentMonthCollected",
              },
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
        onAdd={canCreateAgents ? () => setAddOpened(true) : undefined}
        onFiltersChange={handleFiltersChange}
        onQueryChange={handleQueryChange}
        placeholder={t("tables.searchAgents")}
        query={query}
      />
      <DashboardTableShell
        headers={[
          t("common.fullNames"),
          t("common.phoneNumber"),
          t("common.password"),
          t("common.registeredDate"),
          t("common.status"),
          t("tables.performance"),
          t("tables.action"),
        ]}
        emptyMobileState={
          <NoDataCard
            className="min-h-52 border"
            message={t("tables.createAgentEmpty")}
            title={t("tables.noAgentsFound")}
          />
        }
        hasMoreMobileItems={mobileAgents.length < (agentsQuery.data?.total ?? 0)}
        isLoadingMore={agentsQuery.isFetching && page > 1}
        mobileCards={
          agentsQuery.isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted"
                  key={index}
                />
              ))
            : mobileAgents.map((agent) => (
                <MobileDataCard
                  actions={
                    <Menu position="bottom-end" shadow="md" width={160}>
                      <Menu.Target>
                        <Button
                          aria-label={`Open actions for ${agent.fullNames}`}
                          size="icon"
                          variant="subtle"
                        >
                          <HiEllipsisHorizontal className="size-5" />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          component={Link}
                          href={`/agents/${agent.agentId}`}
                        >
                          {t("common.view")}
                        </Menu.Item>
                        {canEditAgents ? (
                          <Menu.Item
                            onClick={() => setEditingAgentId(agent.agentId)}
                          >
                            {t("forms.editAgentTitle")}
                          </Menu.Item>
                        ) : null}
                        {canEditAgents ? (
                          <Menu.Item
                            color={agent.isActive ? "red" : "green"}
                            onClick={() =>
                              updateStatus(agent.agentId, !agent.isActive)
                            }
                          >
                            {agent.isActive
                              ? t("tables.deactivate")
                              : t("tables.activate")}
                          </Menu.Item>
                        ) : null}
                      </Menu.Dropdown>
                    </Menu>
                  }
                  items={[
                    { label: t("common.phone"), value: agent.phone },
                    {
                      label: t("common.password"),
                      value: (
                        <PasswordCell
                          canReset={canResetPasswords}
                          isDefaultPass={agent.isDefaultPass}
                          isResetting={resettingUserId === agent.userId}
                          onReset={() => resetPassword(agent.userId)}
                        />
                      ),
                    },
                    {
                      label: t("filters.createdAt"),
                      value: formatDate(agent.createdAt),
                    },
                    {
                      label: t("tables.performance"),
                      value: formatCurrency(agent.currentMonthCollected),
                    },
                  ]}
                  key={agent.agentId}
                  status={
                    <StatusBadge
                      status={
                        agent.isActive
                          ? t("common.active")
                          : t("common.inactive")
                      }
                    />
                  }
                  title={agent.fullNames}
                />
              ))
        }
        onLoadMore={loadMore}
        onPageChange={setPage}
        page={page}
        total={totalPages}
      >
        {agentsQuery.isLoading ? (
          <TableSkeletonRows columns={7} rows={PAGE_SIZE} />
        ) : agents.length === 0 ? (
          <TableEmptyRow
            colSpan={7}
            message={t("tables.createAgentEmpty")}
            title={t("tables.noAgentsFound")}
          />
        ) : (
          agents.map((agent) => (
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
                <PasswordCell
                  canReset={canResetPasswords}
                  isDefaultPass={agent.isDefaultPass}
                  isResetting={resettingUserId === agent.userId}
                  onReset={() => resetPassword(agent.userId)}
                />
              </TableTd>
              <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                {formatDate(agent.createdAt)}
              </TableTd>
              <TableTd className="px-8 py-6">
                <StatusBadge
                  status={
                    agent.isActive ? t("common.active") : t("common.inactive")
                  }
                />
              </TableTd>
              <TableTd className="px-4 py-6 text-[14px] text-text-muted">
                <p className="pl-[25px]">
                  {formatCurrency(agent.currentMonthCollected)}
                </p>
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
                    <Menu.Item
                      component={Link}
                      href={`/agents/${agent.agentId}`}
                    >
                      {t("common.view")}
                    </Menu.Item>
                    {canEditAgents ? (
                      <Menu.Item
                        onClick={() => setEditingAgentId(agent.agentId)}
                      >
                        {t("forms.editAgentTitle")}
                      </Menu.Item>
                    ) : null}
                    {canEditAgents ? (
                      <Menu.Item
                        color={agent.isActive ? "red" : "green"}
                        onClick={() =>
                          updateStatus(agent.agentId, !agent.isActive)
                        }
                      >
                        {agent.isActive
                          ? t("tables.deactivate")
                          : t("tables.activate")}
                      </Menu.Item>
                    ) : null}
                  </Menu.Dropdown>
                </Menu>
              </TableTd>
            </TableTr>
          ))
        )}
      </DashboardTableShell>
      <AddAgentModal onClose={() => setAddOpened(false)} opened={addOpened} />
      <AddAgentModal
        agent={editingAgent}
        onClose={() => setEditingAgentId(null)}
        opened={editingAgent !== null}
      />
    </div>
  );
}
