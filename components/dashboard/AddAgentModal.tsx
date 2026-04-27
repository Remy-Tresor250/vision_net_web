"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Select, Skeleton, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import ImportUsersModal from "@/components/dashboard/ImportUsersModal";
import NoDataCard from "@/components/dashboard/NoDataCard";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { adminApi } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAdminAvenuesQuery,
  useAssignAgentAvenuesMutation,
  useCreateAgentMutation,
  useUpdateAgentMutation,
} from "@/lib/query/hooks";
import { agentFormSchema, type AgentFormValues } from "@/lib/validation/admin-users";
import type { AdminAgentDetail, AdminAgentListItem } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  opened: boolean;
  onClose: () => void;
  agent?: Pick<
    AdminAgentListItem | AdminAgentDetail,
    "agentId" | "assignedAvenues" | "fullNames" | "isActive" | "phone"
  > | null;
}

const EMPTY_AVENUE_IDS: string[] = [];

function formatAvenueLabel(avenue: {
  avenueName?: string | null;
  name?: string | null;
  quartierName?: string | null;
  serineName?: string | null;
}) {
  return [avenue.quartierName, avenue.serineName, avenue.avenueName ?? avenue.name]
    .filter(Boolean)
    .join(", ");
}

export default function AddAgentModal({ agent, onClose, opened }: Props) {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canImport = hasAnyPermission(permissions, ["imports.view", "imports.create"]);
  const canViewLocations = hasAnyPermission(permissions, ["locations.view"]);
  const [addAvenueValue, setAddAvenueValue] = useState<string | null>(null);
  const [avenueSearch, setAvenueSearch] = useState("");
  const [resolvedAssignedLabels, setResolvedAssignedLabels] = useState<Record<string, string>>({});
  const createMutation = useCreateAgentMutation();
  const updateMutation = useUpdateAgentMutation(agent?.agentId);
  const assignAvenuesMutation = useAssignAgentAvenuesMutation(agent?.agentId);
  const avenuesQuery = useAdminAvenuesQuery(
    { limit: 100, search: avenueSearch || undefined, skip: 0 },
    { enabled: opened && canViewLocations },
  );
  const isEditing = Boolean(agent);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<AgentFormValues>({
    defaultValues: {
      avenueIds: [],
      fullNames: "",
      phone: "",
    },
    resolver: zodResolver(agentFormSchema),
  });
  const watchedAvenueIds = useWatch({ control, name: "avenueIds" });
  const selectedAvenueIds = watchedAvenueIds ?? EMPTY_AVENUE_IDS;

  const avenueOptionMap = useMemo(() => {
    return new Map(
      (avenuesQuery.data?.data ?? []).map((avenue) => [avenue.id, formatAvenueLabel(avenue)]),
    );
  }, [avenuesQuery.data?.data]);

  const availableAvenueOptions = useMemo(
    () =>
      (avenuesQuery.data?.data ?? [])
        .filter((avenue) => !selectedAvenueIds.includes(avenue.id))
        .map((avenue) => ({
          label: formatAvenueLabel(avenue),
          value: avenue.id,
        })),
    [avenuesQuery.data?.data, selectedAvenueIds],
  );

  const fallbackAssignedLabels = useMemo(
    () =>
      Object.fromEntries(
        (agent?.assignedAvenues ?? []).map((assignedAvenue) => [
          assignedAvenue.avenueId,
          [assignedAvenue.quartierName, assignedAvenue.avenueName].filter(Boolean).join(", "),
        ]),
      ),
    [agent?.assignedAvenues],
  );

  const selectedAvenueLabels = useMemo(
    () =>
      selectedAvenueIds.map((avenueId) => ({
        id: avenueId,
        label:
          avenueOptionMap.get(avenueId) ||
          resolvedAssignedLabels[avenueId] ||
          fallbackAssignedLabels[avenueId] ||
          t("forms.loadingAvenueDetails"),
      })),
    [avenueOptionMap, fallbackAssignedLabels, resolvedAssignedLabels, selectedAvenueIds, t],
  );

  useEffect(() => {
    if (!opened) return;

    setAddAvenueValue(null);
    setAvenueSearch("");
    setResolvedAssignedLabels({});
    reset({
      avenueIds: agent?.assignedAvenues?.map((assignedAvenue) => assignedAvenue.avenueId) ?? [],
      fullNames: agent?.fullNames ?? "",
      phone: agent?.phone ?? "",
    });
  }, [agent, opened, reset]);

  useEffect(() => {
    if (!opened || !agent?.assignedAvenues?.length) {
      return;
    }

    const missingAssignments = agent.assignedAvenues.filter(
      (assignedAvenue) =>
        selectedAvenueIds.includes(assignedAvenue.avenueId) &&
        !avenueOptionMap.has(assignedAvenue.avenueId) &&
        !resolvedAssignedLabels[assignedAvenue.avenueId],
    );

    if (!missingAssignments.length) {
      return;
    }

    let cancelled = false;

    async function resolveAssignedLabels() {
      const nextEntries = await Promise.all(
        missingAssignments.map(async (assignedAvenue) => {
          try {
            const response = await adminApi.avenues({
              limit: 100,
              search: assignedAvenue.avenueName,
              skip: 0,
            });
            const exactMatch = response.data.find((avenue) => avenue.id === assignedAvenue.avenueId);

            return [
              assignedAvenue.avenueId,
              exactMatch
                ? formatAvenueLabel(exactMatch)
                : [assignedAvenue.quartierName, assignedAvenue.avenueName].filter(Boolean).join(", "),
            ] as const;
          } catch {
            return [
              assignedAvenue.avenueId,
              [assignedAvenue.quartierName, assignedAvenue.avenueName].filter(Boolean).join(", "),
            ] as const;
          }
        }),
      );

      if (!cancelled) {
        setResolvedAssignedLabels((current) => ({
          ...current,
          ...Object.fromEntries(nextEntries),
        }));
      }
    }

    void resolveAssignedLabels();

    return () => {
      cancelled = true;
    };
  }, [agent?.assignedAvenues, avenueOptionMap, opened, resolvedAssignedLabels, selectedAvenueIds]);

  async function submit(values: AgentFormValues) {
    const payload = {
      fullNames: values.fullNames,
      phone: values.phone,
    };

    if (isEditing) {
      updateMutation.mutate(payload, {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: async () => {
          try {
            await assignAvenuesMutation.mutateAsync({ avenueIds: values.avenueIds });
            toast.success(t("forms.agentUpdated"));
            reset();
            onClose();
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        },
      });

      return;
    }

    createMutation.mutate(
      {
        ...payload,
        language: "fr",
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: async () => {
          try {
            const agentsResponse = await adminApi.agents({
              limit: 20,
              search: values.phone,
              skip: 0,
            });
            const createdAgent = agentsResponse.data.find(
              (item) => item.phone === values.phone && item.fullNames === values.fullNames,
            );

            if (createdAgent) {
              await assignAvenuesMutation.mutateAsync({
                agentId: createdAgent.agentId,
                avenueIds: values.avenueIds,
              });
            } else if (values.avenueIds.length) {
              throw new Error("The agent was created, but avenue assignment could not be completed.");
            }

            toast.success(t("forms.agentCreated"));
            reset();
            onClose();
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        },
      },
    );
  }

  const isSaving =
    createMutation.isPending || updateMutation.isPending || assignAvenuesMutation.isPending;

  return (
    <Modal
      centered
      classNames={{
        body: "px-8 pb-8",
        content: "rounded-sm",
        header: "px-8 pt-8",
        title: "w-full text-center",
      }}
      closeButtonProps={{
        icon: <HiOutlineXMark className="size-6" />,
      }}
      onClose={onClose}
      opened={opened}
      radius="sm"
      size="xl"
      title={
        <span className="text-[28px] font-semibold text-foreground">
          {isEditing ? t("forms.editAgentTitle") : t("modals.registerAgents")}
        </span>
      }
    >
      <div className="space-y-4 lg:px-6">
        {!isEditing && canImport ? (
          <>
            <ImportUsersModal kind="agents" onImported={onClose} />
            <div className="flex items-center gap-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[13px] text-text-muted">{t("common.or")}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(submit)}>
          <Controller
            control={control}
            name="fullNames"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
                disabled={isSaving}
                error={errors.fullNames?.message}
                label={t("common.fullNames")}
                placeholder={t("forms.fullNamesPlaceholder")}
                styles={appFieldStyles}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneNumberInput
                disabled={isSaving}
                error={errors.phone?.message}
                label={t("common.phone")}
                onChange={field.onChange}
                placeholder="788000000"
                value={field.value}
              />
            )}
          />

          {canViewLocations ? (
            <>
              <div className="md:col-span-2">
                <Select
                  classNames={appFieldClassNames}
                  data={availableAvenueOptions}
                  disabled={avenuesQuery.isLoading || isSaving}
                  label={t("forms.addAvenue")}
                  onChange={(value) => {
                    if (!value || selectedAvenueIds.includes(value)) {
                      setAddAvenueValue(null);
                      return;
                    }

                    setValue("avenueIds", [...selectedAvenueIds, value], { shouldDirty: true });
                    setAddAvenueValue(null);
                    setAvenueSearch("");
                  }}
                  onSearchChange={setAvenueSearch}
                  placeholder={t("forms.addAvenuePlaceholder")}
                  searchable
                  searchValue={avenueSearch}
                  styles={appFieldStyles}
                  value={addAvenueValue}
                />
                {avenuesQuery.isFetching ? (
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 rounded-sm" />
                    <Skeleton className="h-3 w-2/3 rounded-sm" />
                  </div>
                ) : null}
              </div>

              <div className="rounded-sm border border-border bg-surface md:col-span-2">
                <div className="border-b border-border bg-surface-muted px-4 py-3">
                  <p className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
                    {t("forms.selectedAvenues")}
                  </p>
                </div>
                <div className="max-h-[180px] overflow-y-auto px-4 py-4">
                  {avenuesQuery.isFetching && !selectedAvenueLabels.length ? (
                    <div className="space-y-3">
                      <Skeleton className="h-9 rounded-full" />
                      <Skeleton className="h-9 w-3/4 rounded-full" />
                    </div>
                  ) : selectedAvenueLabels.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAvenueLabels.map((item) => (
                        <div
                          className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-[13px] text-foreground"
                          key={item.id}
                        >
                          <span>{item.label}</span>
                          <button
                            aria-label={t("forms.removeAssignedAvenue")}
                            className="text-text-muted hover:text-foreground"
                            disabled={isSaving}
                            onClick={() =>
                              setValue(
                                "avenueIds",
                                selectedAvenueIds.filter((avenueId) => avenueId !== item.id),
                                { shouldDirty: true },
                              )
                            }
                            type="button"
                          >
                            <HiOutlineXMark className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-text-muted">{t("forms.noAssignedAvenues")}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <NoDataCard
                className="min-h-40"
                message={t("permissions.missingLocations")}
                title={t("forms.selectedAvenues")}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 py-4 md:col-span-2">
            <button
              className="flex flex-row items-center gap-[4px] rounded-[6px] border border-gray-500 bg-transparent px-[12px] py-[6px]"
              onClick={onClose}
              type="button"
            >
              <p className="text-[14px] text-black">{t("actions.cancel")}</p>
            </button>
            <button
              className="flex flex-row items-center gap-[4px] rounded-[6px] bg-brand px-[12px] py-[6px]"
              disabled={isSaving}
              type="submit"
            >
              <p className="text-[14px] text-white">
                {isSaving
                  ? isEditing
                    ? t("forms.saving")
                    : t("actions.creating")
                  : isEditing
                    ? t("forms.saveChanges")
                    : t("actions.createAgent")}
              </p>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
