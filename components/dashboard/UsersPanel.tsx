"use client";

import {
  Checkbox,
  Menu,
  Modal,
  Select,
  TableTd,
  TableTr,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiEllipsisHorizontal, HiOutlineShieldCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import DashboardTableShell from "@/components/dashboard/DashboardTableShell";
import FilterToolbar from "@/components/dashboard/FilterToolbar";
import NoDataCard from "@/components/dashboard/NoDataCard";
import StatusBadge from "@/components/ui/StatusBadge";
import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import { hasAnyPermission } from "@/lib/auth/permissions";
import {
  CANONICAL_PERMISSIONS,
  PERMISSION_RESOURCE_ORDER,
} from "@/lib/auth/rbac";
import type { AdminRole, AdminUserListItem, Language } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDate, getPageCount } from "@/lib/format";
import {
  useAdminRoleQuery,
  useAdminRolesQuery,
  useAdminUserQuery,
  useAdminUsersQuery,
  useAssignAdminRoleMutation,
  useCreateAdminMutation,
  useCreateAdminRoleMutation,
  useDeleteAdminMutation,
  useDeleteAdminRoleMutation,
  useUpdateAdminMutation,
  useUpdateAdminRoleMutation,
  useUpdateAdminStatusMutation,
} from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

type UsersTab = "users" | "roles";
type UserModalMode = "create" | "edit" | "view";
type RoleModalMode = "create" | "edit" | "view";

const USERS_PAGE_SIZE = 8;
const ROLES_PAGE_SIZE = 8;

function normalizeRolesData(
  data: Awaited<ReturnType<typeof useAdminRolesQuery>>["data"],
) {
  if (!data) {
    return [] as AdminRole[];
  }

  return Array.isArray(data) ? data : data.data;
}

function UsersTabs({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: UsersTab;
  onChange: (tab: UsersTab) => void;
  tabs: UsersTab[];
}) {
  const { t } = useTranslation();

  return (
    <div
      className="grid w-full max-w-[360px] rounded-[14px] bg-surface-muted p-1.5"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tabValue) => {
        const isActive = activeTab === tabValue;

        return (
          <button
            className={
              isActive
                ? "h-10 rounded-[12px] bg-surface text-brand shadow-card px-4 py-2"
                : "h-10 rounded-[12px] text-text-muted hover:text-foreground px-4 py-2"
            }
            key={tabValue}
            onClick={() => onChange(tabValue)}
            type="button"
          >
            <p className="text-[14px] font-medium">
              {tabValue === "users"
                ? t("userManagement.usersTab")
                : t("userManagement.rolesTab")}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function PermissionSelector({
  disabled,
  onChange,
  selectedPermissions,
}: {
  disabled: boolean;
  onChange: (permissions: string[]) => void;
  selectedPermissions: string[];
}) {
  const { t } = useTranslation();
  const selectedSet = useMemo(
    () => new Set(selectedPermissions),
    [selectedPermissions],
  );

  function togglePermission(permission: string) {
    if (selectedSet.has(permission)) {
      onChange(selectedPermissions.filter((item) => item !== permission));
      return;
    }

    onChange([...selectedPermissions, permission]);
  }

  function getPermissionLabel(permission: string) {
    const [resource, action] = permission.split(".");

    return `${t(`userManagement.permissionResources.${resource}`)} • ${t(`userManagement.permissionActions.${action}`)}`;
  }

  return (
    <div className="space-y-4">
      {PERMISSION_RESOURCE_ORDER.map((resource) => {
        const resourcePermissions = CANONICAL_PERMISSIONS.filter((permission) =>
          permission.startsWith(`${resource}.`),
        );

        if (!resourcePermissions.length) {
          return null;
        }

        return (
          <section
            className="rounded-sm border border-border bg-surface-muted p-4"
            key={resource}
          >
            <p className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
              {t(`userManagement.permissionResources.${resource}`)}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {resourcePermissions.map((permission) => (
                <Checkbox
                  checked={selectedSet.has(permission)}
                  disabled={disabled}
                  key={permission}
                  label={getPermissionLabel(permission)}
                  onChange={() => togglePermission(permission)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function UsersPanel() {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canViewUsers = hasAnyPermission(permissions, ["admin_users.view"]);
  const canCreateUsers = hasAnyPermission(permissions, ["admin_users.create"]);
  const canEditUsers = hasAnyPermission(permissions, ["admin_users.edit"]);
  const canDeleteUsers = hasAnyPermission(permissions, ["admin_users.delete"]);
  const canViewRoles = hasAnyPermission(permissions, ["roles.view"]);
  const canCreateRoles = hasAnyPermission(permissions, ["roles.create"]);
  const canEditRoles = hasAnyPermission(permissions, ["roles.edit"]);
  const canDeleteRoles = hasAnyPermission(permissions, ["roles.delete"]);

  const availableTabs = (
    [canViewUsers ? "users" : null, canViewRoles ? "roles" : null] as const
  ).filter((item): item is UsersTab => Boolean(item));

  const [activeTab, setActiveTab] = useState<UsersTab>(
    availableTabs[0] ?? "users",
  );
  const resolvedActiveTab = availableTabs.includes(activeTab)
    ? activeTab
    : (availableTabs[0] ?? "users");

  const [usersPage, setUsersPage] = useState(1);
  const [usersQuery, setUsersQuery] = useState("");
  const [usersFilters, setUsersFilters] = useState<Record<string, string>>({
    isActive: "",
  });
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesQuery, setRolesQuery] = useState("");

  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [userModalMode, setUserModalMode] = useState<UserModalMode | null>(
    null,
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleModalMode, setRoleModalMode] = useState<RoleModalMode | null>(
    null,
  );

  const usersParams = {
    isActive:
      usersFilters.isActive === "true"
        ? true
        : usersFilters.isActive === "false"
          ? false
          : undefined,
    limit: USERS_PAGE_SIZE,
    search: usersQuery || undefined,
    skip: (usersPage - 1) * USERS_PAGE_SIZE,
  };

  const rolesParams = {
    limit: ROLES_PAGE_SIZE,
    search: rolesQuery || undefined,
    skip: (rolesPage - 1) * ROLES_PAGE_SIZE,
  };

  const usersQueryResult = useAdminUsersQuery(usersParams, {
    enabled: canViewUsers,
  });
  const rolesQueryResult = useAdminRolesQuery(rolesParams, {
    enabled: canViewRoles,
  });
  const selectedUserQuery = useAdminUserQuery(selectedAdminId ?? "", {
    enabled: Boolean(selectedAdminId) && canViewUsers,
  });
  const selectedRoleQuery = useAdminRoleQuery(selectedRoleId ?? "", {
    enabled: Boolean(selectedRoleId) && canViewRoles,
  });

  const createAdminMutation = useCreateAdminMutation();
  const updateAdminMutation = useUpdateAdminMutation(
    selectedAdminId ?? undefined,
  );
  const updateAdminStatusMutation = useUpdateAdminStatusMutation();
  const assignAdminRoleMutation = useAssignAdminRoleMutation(
    selectedAdminId ?? undefined,
  );
  const deleteAdminMutation = useDeleteAdminMutation();

  const createRoleMutation = useCreateAdminRoleMutation();
  const updateRoleMutation = useUpdateAdminRoleMutation(
    selectedRoleId ?? undefined,
  );
  const deleteRoleMutation = useDeleteAdminRoleMutation();

  const users = usersQueryResult.data?.data ?? [];
  const usersTotalPages = getPageCount(
    usersQueryResult.data?.total ?? 0,
    USERS_PAGE_SIZE,
  );
  const roles = normalizeRolesData(rolesQueryResult.data);
  const rolesTotalItems = Array.isArray(rolesQueryResult.data)
    ? roles.length
    : (rolesQueryResult.data?.total ?? roles.length);
  const rolesTotalPages = getPageCount(rolesTotalItems, ROLES_PAGE_SIZE);
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  function openUserModal(mode: UserModalMode, adminId?: string) {
    setSelectedAdminId(adminId ?? null);
    setUserModalMode(mode);
  }

  function closeUserModal() {
    setSelectedAdminId(null);
    setUserModalMode(null);
  }

  function openRoleModal(mode: RoleModalMode, roleId?: string) {
    setSelectedRoleId(roleId ?? null);
    setRoleModalMode(mode);
  }

  function closeRoleModal() {
    setSelectedRoleId(null);
    setRoleModalMode(null);
  }

  async function handleDeleteAdmin(admin: AdminUserListItem) {
    const shouldDelete = window.confirm(
      t("userManagement.confirmDeleteUser", { name: admin.fullNames }),
    );

    if (!shouldDelete) {
      return;
    }

    deleteAdminMutation.mutate(admin.adminId, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: () => toast.success(t("userManagement.userDeleted")),
    });
  }

  async function handleDeleteRole(role: AdminRole) {
    const shouldDelete = window.confirm(
      t("userManagement.confirmDeleteRole", { name: role.name }),
    );

    if (!shouldDelete) {
      return;
    }

    deleteRoleMutation.mutate(role.id, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: () => toast.success(t("userManagement.roleDeleted")),
    });
  }

  const usersToolbarTitle = (
    <div>
      <p className="text-[27px] font-medium text-[#0A3B24]">{t("nav.users")}</p>
      <div className="mt-1">
        <UsersTabs
          activeTab={resolvedActiveTab}
          onChange={setActiveTab}
          tabs={availableTabs}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 py-3">
      {resolvedActiveTab === "users" ? (
        canViewUsers ? (
          <>
            <FilterToolbar
              className="items-start"
              addLabel={
                canCreateUsers ? t("userManagement.addUser") : undefined
              }
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
              ]}
              filters={usersFilters}
              onFiltersChange={(value) => {
                setUsersFilters(value);
                setUsersPage(1);
              }}
              onQueryChange={(value) => {
                setUsersQuery(value);
                setUsersPage(1);
              }}
              onAdd={canCreateUsers ? () => openUserModal("create") : undefined}
              placeholder={t("userManagement.searchUsers")}
              query={usersQuery}
              title={usersToolbarTitle}
            />
            <DashboardTableShell
              headers={[
                t("common.fullNames"),
                t("common.phone"),
                t("userManagement.role"),
                t("common.language"),
                t("common.status"),
                t("userManagement.firstLogin"),
                t("common.registeredDate"),
                t("tables.action"),
              ]}
              onPageChange={setUsersPage}
              page={usersPage}
              total={usersTotalPages}
            >
              {usersQueryResult.isLoading || usersQueryResult.isFetching ? (
                <TableSkeletonRows columns={8} rows={USERS_PAGE_SIZE} />
              ) : users.length === 0 ? (
                <TableEmptyRow
                  colSpan={8}
                  message={t("userManagement.noUsersMessage")}
                  title={t("userManagement.noUsersTitle")}
                />
              ) : (
                users.map((admin) => (
                  <TableTr
                    className="border-b border-border last:border-b-0"
                    key={admin.adminId}
                  >
                    <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                      {admin.fullNames}
                    </TableTd>
                    <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                      {admin.phone}
                    </TableTd>
                    <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                      {admin.role?.name ?? "-"}
                    </TableTd>
                    <TableTd className="px-8 py-6 text-[14px] uppercase text-text-muted">
                      {admin.language}
                    </TableTd>
                    <TableTd className="px-8 py-6">
                      <StatusBadge
                        status={
                          admin.isActive
                            ? t("common.active")
                            : t("common.inactive")
                        }
                      />
                    </TableTd>
                    <TableTd className="px-8 py-6">
                      <StatusBadge
                        status={
                          admin.firstLoginCompleted
                            ? t("userManagement.completed")
                            : t("userManagement.pending")
                        }
                      />
                    </TableTd>
                    <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                      {formatDate(admin.createdAt)}
                    </TableTd>
                    <TableTd className="px-8 py-6 text-center">
                      <Menu position="bottom-end" shadow="md" width={170}>
                        <Menu.Target>
                          <Button
                            aria-label={`Open actions for ${admin.fullNames}`}
                            size="icon"
                            variant="subtle"
                          >
                            <HiEllipsisHorizontal className="size-6" />
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={() => openUserModal("view", admin.adminId)}
                          >
                            {t("common.view")}
                          </Menu.Item>
                          {canEditUsers ? (
                            <Menu.Item
                              onClick={() =>
                                openUserModal("edit", admin.adminId)
                              }
                            >
                              {t("userManagement.editUser")}
                            </Menu.Item>
                          ) : null}
                          {canEditUsers ? (
                            <Menu.Item
                              color={admin.isActive ? "red" : "green"}
                              onClick={() =>
                                updateAdminStatusMutation.mutate(
                                  {
                                    adminId: admin.adminId,
                                    isActive: !admin.isActive,
                                  },
                                  {
                                    onError: (error) =>
                                      toast.error(getApiErrorMessage(error)),
                                    onSuccess: () =>
                                      toast.success(
                                        admin.isActive
                                          ? t("userManagement.userDeactivated")
                                          : t("userManagement.userActivated"),
                                      ),
                                  },
                                )
                              }
                            >
                              {admin.isActive
                                ? t("tables.deactivate")
                                : t("tables.activate")}
                            </Menu.Item>
                          ) : null}
                          {canDeleteUsers ? (
                            <Menu.Item
                              color="red"
                              onClick={() => handleDeleteAdmin(admin)}
                            >
                              {t("userManagement.deleteUser")}
                            </Menu.Item>
                          ) : null}
                        </Menu.Dropdown>
                      </Menu>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </DashboardTableShell>
          </>
        ) : (
          <NoDataCard
            message={t("permissions.limitedData")}
            title={t("userManagement.usersTab")}
          />
        )
      ) : canViewRoles ? (
        <>
          <FilterToolbar
            className="items-start"
            addLabel={canCreateRoles ? t("userManagement.addRole") : undefined}
            onAdd={canCreateRoles ? () => openRoleModal("create") : undefined}
            onQueryChange={(value) => {
              setRolesQuery(value);
              setRolesPage(1);
            }}
            placeholder={t("userManagement.searchRoles")}
            query={rolesQuery}
            title={usersToolbarTitle}
          />
          <DashboardTableShell
            headers={[
              t("userManagement.roleName"),
              t("userManagement.description"),
              t("userManagement.permissions"),
              t("common.date"),
              t("tables.action"),
            ]}
            onPageChange={setRolesPage}
            page={rolesPage}
            total={rolesTotalPages}
          >
            {rolesQueryResult.isLoading || rolesQueryResult.isFetching ? (
              <TableSkeletonRows columns={6} rows={ROLES_PAGE_SIZE} />
            ) : roles.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                message={t("userManagement.noRolesMessage")}
                title={t("userManagement.noRolesTitle")}
              />
            ) : (
              roles.map((role) => (
                <TableTr
                  className="border-b border-border last:border-b-0"
                  key={role.id}
                >
                  <TableTd className="px-8 py-6 text-[14px] font-medium text-foreground">
                    {role.name}
                  </TableTd>
                  <TableTd className="px-8 py-6 text-[14px] text-text-muted max-w-[200px]">
                    {role.description?.trim() || "-"}
                  </TableTd>
                  <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                    {t("userManagement.permissionsCount", {
                      count: role.permissions.length,
                    })}
                  </TableTd>
                  <TableTd className="px-8 py-6 text-[14px] text-text-muted">
                    {formatDate(role.updatedAt)}
                  </TableTd>
                  <TableTd className="px-8 py-6 text-center">
                    <Menu position="bottom-end" shadow="md" width={170}>
                      <Menu.Target>
                        <Button
                          aria-label={`Open actions for ${role.name}`}
                          size="icon"
                          variant="subtle"
                        >
                          <HiEllipsisHorizontal className="size-6" />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() => openRoleModal("view", role.id)}
                        >
                          {t("common.view")}
                        </Menu.Item>
                        {canEditRoles ? (
                          <Menu.Item
                            onClick={() => openRoleModal("edit", role.id)}
                          >
                            {t("userManagement.editRole")}
                          </Menu.Item>
                        ) : null}
                        {canDeleteRoles ? (
                          <Menu.Item
                            color="red"
                            disabled={role.isSystem}
                            onClick={() => handleDeleteRole(role)}
                          >
                            {t("userManagement.deleteRole")}
                          </Menu.Item>
                        ) : null}
                      </Menu.Dropdown>
                    </Menu>
                  </TableTd>
                </TableTr>
              ))
            )}
          </DashboardTableShell>
        </>
      ) : (
        <NoDataCard
          message={t("permissions.limitedData")}
          title={t("userManagement.rolesTab")}
        />
      )}

      <UserModal
        canEditRoles={canViewRoles && canEditUsers}
        key={`user-${userModalMode ?? "closed"}-${selectedAdminId ?? "new"}`}
        mode={userModalMode}
        onClose={closeUserModal}
        onCreate={(payload) =>
          createAdminMutation.mutate(payload, {
            onError: (error) => toast.error(getApiErrorMessage(error)),
            onSuccess: () => {
              toast.success(t("userManagement.userCreated"));
              closeUserModal();
            },
          })
        }
        onUpdate={async (payload) => {
          if (!selectedAdminId) {
            return;
          }

          updateAdminMutation.mutate(
            {
              adminId: selectedAdminId,
              fullNames: payload.fullNames,
              language: payload.language,
            },
            {
              onError: (error) => toast.error(getApiErrorMessage(error)),
              onSuccess: async () => {
                if (payload.roleId) {
                  assignAdminRoleMutation.mutate(
                    { adminId: selectedAdminId, roleId: payload.roleId },
                    {
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error)),
                      onSuccess: () => {
                        toast.success(t("userManagement.userUpdated"));
                        closeUserModal();
                      },
                    },
                  );
                  return;
                }

                toast.success(t("userManagement.userUpdated"));
                closeUserModal();
              },
            },
          );
        }}
        roleOptions={roleOptions}
        rolesLoading={rolesQueryResult.isLoading}
        selectedUser={
          selectedUserQuery.data ??
          users.find((item) => item.adminId === selectedAdminId) ??
          null
        }
        submitting={
          createAdminMutation.isPending ||
          updateAdminMutation.isPending ||
          assignAdminRoleMutation.isPending
        }
      />

      <RoleModal
        key={`role-${roleModalMode ?? "closed"}-${selectedRoleId ?? "new"}`}
        mode={roleModalMode}
        onClose={closeRoleModal}
        onCreate={(payload) =>
          createRoleMutation.mutate(payload, {
            onError: (error) => toast.error(getApiErrorMessage(error)),
            onSuccess: () => {
              toast.success(t("userManagement.roleCreated"));
              closeRoleModal();
            },
          })
        }
        onUpdate={(payload) =>
          updateRoleMutation.mutate(
            { ...payload, roleId: selectedRoleId ?? undefined },
            {
              onError: (error) => toast.error(getApiErrorMessage(error)),
              onSuccess: () => {
                toast.success(t("userManagement.roleUpdated"));
                closeRoleModal();
              },
            },
          )
        }
        selectedRole={
          selectedRoleQuery.data ??
          roles.find((item) => item.id === selectedRoleId) ??
          null
        }
        submitting={
          createRoleMutation.isPending || updateRoleMutation.isPending
        }
      />
    </div>
  );
}

function UserModal({
  canEditRoles,
  mode,
  onClose,
  onCreate,
  onUpdate,
  roleOptions,
  rolesLoading,
  selectedUser,
  submitting,
}: {
  canEditRoles: boolean;
  mode: UserModalMode | null;
  onClose: () => void;
  onCreate: (payload: {
    fullNames: string;
    phone: string;
    language: Language;
    roleId?: string;
  }) => void;
  onUpdate: (payload: {
    fullNames: string;
    language: Language;
    roleId?: string;
  }) => void;
  roleOptions: Array<{ label: string; value: string }>;
  rolesLoading: boolean;
  selectedUser: AdminUserListItem | null;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  const opened = Boolean(mode);
  const isView = mode === "view";
  const isCreate = mode === "create";
  const [fullNames, setFullNames] = useState(selectedUser?.fullNames ?? "");
  const [phone, setPhone] = useState(selectedUser?.phone ?? "");
  const [language, setLanguage] = useState<Language>(
    selectedUser?.language ?? "fr",
  );
  const [roleId, setRoleId] = useState<string>(selectedUser?.role?.id ?? "");

  function handleSubmit() {
    if (!fullNames.trim()) {
      toast.error(t("userManagement.enterFullName"));
      return;
    }

    if (isCreate && !phone.trim()) {
      toast.error(t("userManagement.enterPhone"));
      return;
    }

    if (isCreate) {
      onCreate({
        fullNames: fullNames.trim(),
        language,
        phone,
        roleId: roleId || undefined,
      });
      return;
    }

    onUpdate({
      fullNames: fullNames.trim(),
      language,
      roleId: roleId || undefined,
    });
  }

  return (
    <Modal
      centered
      classNames={{
        body: "px-6 pb-6 sm:px-8 sm:pb-8",
        content: "rounded-sm",
        header: "px-6 pt-6 sm:px-8 sm:pt-8",
      }}
      onClose={onClose}
      opened={opened}
      radius="sm"
      size="lg"
      title={
        <span className="text-[26px] font-semibold text-foreground">
          {isCreate
            ? t("userManagement.addUser")
            : isView
              ? t("userManagement.viewUser")
              : t("userManagement.editUser")}
        </span>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          classNames={appFieldClassNames}
          disabled={submitting || isView}
          label={t("common.fullNames")}
          onChange={(event) => setFullNames(event.currentTarget.value)}
          styles={appFieldStyles}
          value={fullNames}
        />
        <PhoneNumberInput
          disabled={!isCreate || submitting || isView}
          label={t("common.phone")}
          onChange={setPhone}
          value={phone}
        />
        <Select
          classNames={appFieldClassNames}
          data={[
            { label: "FR", value: "fr" },
            { label: "EN", value: "en" },
          ]}
          disabled={submitting || isView}
          label={t("common.language")}
          onChange={(value) => setLanguage((value as Language) ?? "fr")}
          styles={appFieldStyles}
          value={language}
        />
        {canEditRoles ? (
          <Select
            classNames={appFieldClassNames}
            data={roleOptions}
            disabled={rolesLoading || submitting || isView}
            label={t("userManagement.role")}
            onChange={(value) => setRoleId(value ?? "")}
            placeholder={t("userManagement.selectRole")}
            styles={appFieldStyles}
            value={roleId || null}
          />
        ) : selectedUser?.role?.name ? (
          <TextInput
            classNames={appFieldClassNames}
            disabled
            label={t("userManagement.role")}
            styles={appFieldStyles}
            value={selectedUser.role.name}
          />
        ) : null}
      </div>
      {!isCreate && selectedUser ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput
            classNames={appFieldClassNames}
            disabled
            label={t("common.status")}
            styles={appFieldStyles}
            value={
              selectedUser.isActive ? t("common.active") : t("common.inactive")
            }
          />
          <TextInput
            classNames={appFieldClassNames}
            disabled
            label={t("userManagement.firstLogin")}
            styles={appFieldStyles}
            value={
              selectedUser.firstLoginCompleted
                ? t("userManagement.completed")
                : t("userManagement.pending")
            }
          />
        </div>
      ) : null}
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">
          {t("actions.cancel")}
        </Button>
        {!isView ? (
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting
              ? t("forms.saving")
              : isCreate
                ? t("userManagement.createUser")
                : t("forms.saveChanges")}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}

function RoleModal({
  mode,
  onClose,
  onCreate,
  onUpdate,
  selectedRole,
  submitting,
}: {
  mode: RoleModalMode | null;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    description?: string;
    permissions: string[];
  }) => void;
  onUpdate: (payload: {
    name: string;
    description?: string;
    permissions: string[];
  }) => void;
  selectedRole: AdminRole | null;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  const opened = Boolean(mode);
  const isView = mode === "view";
  const isCreate = mode === "create";
  const [name, setName] = useState(selectedRole?.name ?? "");
  const [description, setDescription] = useState(
    selectedRole?.description ?? "",
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    selectedRole?.permissions ?? [],
  );

  function handleSubmit() {
    if (!name.trim()) {
      toast.error(t("userManagement.enterRoleName"));
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(name.trim())) {
      toast.error(t("userManagement.invalidRoleName"));
      return;
    }

    if (description.trim().length > 200) {
      toast.error(t("userManagement.roleDescriptionTooLong"));
      return;
    }

    if (!selectedPermissions.length) {
      toast.error(t("userManagement.selectPermissions"));
      return;
    }

    const payload = {
      description: description.trim() || undefined,
      name: name.trim(),
      permissions: selectedPermissions,
    };

    if (isCreate) {
      onCreate(payload);
      return;
    }

    onUpdate(payload);
  }

  return (
    <Modal
      centered
      classNames={{
        content: "rounded-sm",
      }}
      styles={{
        body: {
          padding: "12px 50px",
        },
        header: {
          padding: "10px 20px",
        },
      }}
      onClose={onClose}
      opened={opened}
      radius="sm"
      size="xl"
      title={
        <span className="text-[26px] font-semibold text-foreground">
          {isCreate
            ? t("userManagement.addRole")
            : isView
              ? t("userManagement.viewRole")
              : t("userManagement.editRole")}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            classNames={appFieldClassNames}
            disabled={submitting || isView}
            description={t("userManagement.roleNameHint")}
            label={t("userManagement.roleName")}
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="ops_manager"
            styles={appFieldStyles}
            value={name}
          />

          <div className="flex flex-col">
            <Textarea
              classNames={appFieldClassNames}
              disabled={submitting || isView}
              label={t("userManagement.description")}
              maxLength={200}
              description={t("userManagement.descriptionCount", {
                count: description.length,
                max: 200,
              })}
              placeholder={t("userManagement.descriptionPlaceholder")}
              minRows={3}
              onChange={(event) =>
                setDescription(event.currentTarget.value.slice(0, 200))
              }
              styles={appFieldStyles}
              value={description}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-brand/10 text-brand">
              <HiOutlineShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                {t("userManagement.permissions")}
              </p>
              <p className="text-[13px] text-text-muted">
                {t("userManagement.permissionsHelp")}
              </p>
            </div>
          </div>
          <PermissionSelector
            disabled={submitting || isView}
            onChange={setSelectedPermissions}
            selectedPermissions={selectedPermissions}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">
          {t("actions.cancel")}
        </Button>
        {!isView ? (
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting
              ? t("forms.saving")
              : isCreate
                ? t("userManagement.createRole")
                : t("forms.saveChanges")}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}
