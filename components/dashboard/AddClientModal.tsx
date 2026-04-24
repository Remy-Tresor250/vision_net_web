"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DatePickerInput } from "@mantine/dates";
import { Modal, Select, TextInput } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import ImportUsersModal from "@/components/dashboard/ImportUsersModal";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAdminAvenuesQuery,
  useAdminQuartiersQuery,
  useAdminSerinesQuery,
  useAdminServiceTypesQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
} from "@/lib/query/hooks";
import type {
  AdminClientDetail,
  AdminClientListItem,
  ClientType,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/lib/api/types";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validation/admin-users";

interface Props {
  opened: boolean;
  onClose: () => void;
  client?: Pick<
    AdminClientListItem | AdminClientDetail,
    | "avenueId"
    | "clientId"
    | "code"
    | "fullNames"
    | "phone"
    | "quartierId"
    | "registeredDate"
    | "serineId"
    | "type"
    | "clientType"
    | "serviceTypeId"
    | "subscriptionAmount"
  > | null;
  defaultClientType?: ClientType;
}

function toDateValue(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateString(value: Date | string | null) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildClientPayload(
  values: ClientFormValues,
): Omit<CreateClientPayload, "language"> | UpdateClientPayload {
  const basePayload = {
    avenueId: values.avenueId,
    clientType: values.clientType,
    code: values.code?.trim() || undefined,
    fullNames: values.fullNames,
    phone: values.phone,
    quartierId: values.quartierId,
    registeredDate: values.registeredDate || undefined,
    serineId: values.serineId,
  };

  if (values.clientType === "POTENTIAL") {
    return {
      ...basePayload,
      subscriptionAmount: values.subscriptionAmount || undefined,
    };
  }

  return {
    ...basePayload,
    serviceTypeId: values.serviceTypeId || undefined,
  };
}

export default function AddClientModal({
  client,
  defaultClientType = "NORMAL",
  onClose,
  opened,
}: Props) {
  const { i18n, t } = useTranslation();
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation(client?.clientId);
  const isEditing = Boolean(client);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ClientFormValues>({
    defaultValues: {
      avenueId: "",
      clientType: defaultClientType,
      code: "",
      fullNames: "",
      phone: "",
      quartierId: "",
      registeredDate: new Date().toISOString().slice(0, 10),
      serineId: "",
      serviceTypeId: "",
      subscriptionAmount: "",
    },
    resolver: zodResolver(clientFormSchema),
  });

  const watchedQuartierId = useWatch({ control, name: "quartierId" });
  const watchedSerineId = useWatch({ control, name: "serineId" });
  const watchedClientType = useWatch({ control, name: "clientType" });

  const serviceTypesQuery = useAdminServiceTypesQuery({ limit: 100, skip: 0 });
  const quartiersQuery = useAdminQuartiersQuery({ limit: 100, skip: 0 });
  const serinesQuery = useAdminSerinesQuery(
    {
      limit: 100,
      quartierId: watchedQuartierId || undefined,
      skip: 0,
    },
    { enabled: Boolean(watchedQuartierId) },
  );
  const avenuesQuery = useAdminAvenuesQuery(
    {
      limit: 100,
      quartierId: watchedQuartierId || undefined,
      serineId: watchedSerineId || undefined,
      skip: 0,
    },
    { enabled: Boolean(watchedQuartierId && watchedSerineId) },
  );

  const quartierOptions = useMemo(
    () =>
      (quartiersQuery.data?.data ?? []).map((quartier) => ({
        label: quartier.name,
        value: quartier.id,
      })),
    [quartiersQuery.data?.data],
  );
  const serineOptions = useMemo(
    () =>
      (serinesQuery.data?.data ?? []).map((serine) => ({
        label: serine.name,
        value: serine.id,
      })),
    [serinesQuery.data?.data],
  );
  const avenueOptions = useMemo(
    () =>
      (avenuesQuery.data?.data ?? []).map((avenue) => ({
        label: avenue.name,
        value: avenue.id,
      })),
    [avenuesQuery.data?.data],
  );
  const serviceTypeOptions = useMemo(
    () =>
      (serviceTypesQuery.data?.data ?? []).map((serviceType) => ({
        label: serviceType.name,
        value: serviceType.id,
      })),
    [serviceTypesQuery.data?.data],
  );

  useEffect(() => {
    if (!opened) {
      return;
    }

    reset({
      avenueId: client?.avenueId ?? "",
      clientType: client?.clientType ?? client?.type ?? defaultClientType,
      code: client?.code ?? "",
      fullNames: client?.fullNames ?? "",
      phone: client?.phone ?? "",
      quartierId: client?.quartierId ?? "",
      registeredDate:
        client?.registeredDate ?? new Date().toISOString().slice(0, 10),
      serineId: client?.serineId ?? "",
      serviceTypeId: client?.serviceTypeId ?? "",
      subscriptionAmount: client?.subscriptionAmount ?? "",
    });
  }, [client, defaultClientType, opened, reset]);

  useEffect(() => {
    if (!opened || isEditing) {
      return;
    }

    reset({
      avenueId: "",
      clientType: defaultClientType,
      code: "",
      fullNames: "",
      phone: "",
      quartierId: "",
      registeredDate: new Date().toISOString().slice(0, 10),
      serineId: "",
      serviceTypeId: "",
      subscriptionAmount: "",
    });
  }, [defaultClientType, isEditing, opened, reset]);

  function submit(values: ClientFormValues) {
    const payload = buildClientPayload(values);

    if (isEditing) {
      updateMutation.mutate(payload, {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("forms.clientUpdated"));
          reset();
          onClose();
        },
      });

      return;
    }

    createMutation.mutate(
      {
        ...payload,
        language: i18n.language === "en" ? "en" : "fr",
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("forms.clientCreated"));
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      centered
      classNames={{
        body: "px-4 pb-6 sm:px-8 sm:pb-8",
        content: "rounded-sm",
        header: "px-4 pt-6 sm:px-8 sm:pt-8",
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
          {isEditing ? t("forms.editClientTitle") : t("modals.registerClients")}
        </span>
      }
    >
      <div className="space-y-3 lg:px-6">
        {!isEditing ? (
          <>
            <ImportUsersModal
              clientType={watchedClientType}
              kind="clients"
              onImported={onClose}
            />
            <div className="flex items-center gap-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[13px] text-text-muted">
                {t("common.or")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : null}
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(submit)}
        >
          <Controller
            control={control}
            name="fullNames"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
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
                error={errors.phone?.message}
                label={t("common.phone")}
                onChange={field.onChange}
                placeholder="788000000"
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
                error={errors.code?.message}
                label={t("common.code")}
                placeholder="ex. CL-1001"
                styles={appFieldStyles}
              />
            )}
          />
          {watchedClientType === "NORMAL" ? (
            <Controller
              control={control}
              name="serviceTypeId"
              render={({ field }) => (
                <Select
                  classNames={appFieldClassNames}
                  data={serviceTypeOptions}
                  error={errors.serviceTypeId?.message}
                  label={t("common.service")}
                  onChange={(value) => field.onChange(value ?? "")}
                  placeholder={t("forms.selectServicePlaceholder")}
                  styles={appFieldStyles}
                  value={field.value}
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="subscriptionAmount"
              render={({ field }) => (
                <TextInput
                  {...field}
                  classNames={appFieldClassNames}
                  error={errors.subscriptionAmount?.message}
                  label={t("forms.subscriptionAmount")}
                  placeholder={t("forms.subscriptionAmountPlaceholder")}
                  styles={appFieldStyles}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="quartierId"
            render={({ field }) => (
              <Select
                classNames={appFieldClassNames}
                data={quartierOptions}
                error={errors.quartierId?.message}
                label={t("configurations.quartier")}
                onChange={(value) => {
                  field.onChange(value ?? "");
                  setValue("serineId", "");
                  setValue("avenueId", "");
                }}
                placeholder={t("forms.selectQuartierPlaceholder")}
                styles={appFieldStyles}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="serineId"
            render={({ field }) => (
              <Select
                classNames={appFieldClassNames}
                data={serineOptions}
                disabled={!watchedQuartierId}
                error={errors.serineId?.message}
                label={t("configurations.serine")}
                onChange={(value) => {
                  field.onChange(value ?? "");
                  setValue("avenueId", "");
                }}
                placeholder={t("forms.selectSerinePlaceholder")}
                styles={appFieldStyles}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="avenueId"
            render={({ field }) => (
              <Select
                searchable
                classNames={appFieldClassNames}
                data={avenueOptions}
                disabled={!watchedSerineId}
                error={errors.avenueId?.message}
                label={t("configurations.avenues")}
                onChange={(value) => field.onChange(value ?? "")}
                placeholder={t("forms.searchAvenuePlaceholder")}
                styles={appFieldStyles}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="registeredDate"
            render={({ field }) => (
              <DatePickerInput
                classNames={appFieldClassNames}
                clearable
                error={errors.registeredDate?.message}
                label={t("common.registeredDate")}
                locale={i18n.language}
                onChange={(value) => field.onChange(toDateString(value))}
                styles={appFieldStyles}
                value={toDateValue(field.value)}
                valueFormat="DD/MM/YYYY"
              />
            )}
          />
          <div className="flex flex-col-reverse gap-3 py-4 sm:flex-row sm:justify-end md:col-span-2">
            <button
              className="flex w-full flex-row items-center justify-center gap-[4px] rounded-[6px] border-[1px] border-solid border-gray-500 bg-transparent px-[12px] py-[10px] sm:w-auto sm:py-[6px]"
              onClick={onClose}
              type="button"
            >
              <p className="text-[14px] text-black">{t("actions.cancel")}</p>
            </button>
            <button
              className="flex w-full flex-row items-center justify-center gap-[4px] rounded-[6px] bg-brand px-[12px] py-[10px] sm:w-auto sm:py-[6px]"
              disabled={createMutation.isPending || updateMutation.isPending}
              type="submit"
            >
              <p className="text-[14px] text-white">
                {createMutation.isPending || updateMutation.isPending
                  ? isEditing
                    ? t("forms.saving")
                    : t("actions.creating")
                  : isEditing
                    ? t("forms.saveChanges")
                    : t("actions.createClient")}
              </p>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
