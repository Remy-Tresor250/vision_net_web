"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DatePickerInput } from "@mantine/dates";
import { Modal, Select, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import ImportUsersModal from "@/components/dashboard/ImportUsersModal";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { getApiErrorMessage } from "@/lib/api/client";
import { useCreateClientMutation, useUpdateClientMutation } from "@/lib/query/hooks";
import type { AdminClientDetail, AdminClientListItem } from "@/lib/api/types";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validation/admin-users";

interface Props {
  opened: boolean;
  onClose: () => void;
  client?: Pick<
    AdminClientListItem | AdminClientDetail,
    "address" | "clientId" | "fullNames" | "phone" | "registeredDate" | "subscriptionAmount" | "type"
  > | null;
}

function toDateValue(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateString(value: Date | string | null) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddClientModal({ client, onClose, opened }: Props) {
  const { i18n, t } = useTranslation();
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation(client?.clientId);
  const isEditing = Boolean(client);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ClientFormValues>({
    defaultValues: {
      address: "",
      fullNames: "",
      phone: "",
      registeredDate: new Date().toISOString().slice(0, 10),
      subscriptionAmount: "20.00",
      type: "NORMAL",
    },
    resolver: zodResolver(clientFormSchema),
  });

  useEffect(() => {
    if (!opened) return;

    reset({
      address: client?.address ?? "",
      fullNames: client?.fullNames ?? "",
      phone: client?.phone ?? "",
      registeredDate: client?.registeredDate ?? new Date().toISOString().slice(0, 10),
      subscriptionAmount: client?.subscriptionAmount ?? "20.00",
      type: client?.type ?? "NORMAL",
    });
  }, [client, opened, reset]);

  function submit(values: ClientFormValues) {
    if (isEditing) {
      updateMutation.mutate(values, {
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
        ...values,
        language: "fr",
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
          {isEditing ? t("forms.editClientTitle") : t("modals.registerClients")}
        </span>
      }
    >
      <div className="space-y-3 lg:px-6">
        {!isEditing ? (
          <>
            <ImportUsersModal kind="clients" onImported={onClose} />
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
            name="address"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
                error={errors.address?.message}
                label={t("common.address")}
                placeholder={t("forms.addressPlaceholder")}
                styles={appFieldStyles}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
                <Select
                  classNames={appFieldClassNames}
                  data={[
                    { label: "Normal", value: "NORMAL" },
                    { label: "Potentiel", value: "POTENTIEL" },
                  ]}
                  error={errors.type?.message}
                  label={t("forms.selectType")}
                  onChange={(value) => field.onChange(value ?? "NORMAL")}
                  styles={appFieldStyles}
                  value={field.value}
                />
              )}
            />
          <Controller
            control={control}
            name="subscriptionAmount"
            render={({ field }) => (
                <TextInput
                  {...field}
                  classNames={appFieldClassNames}
                  error={errors.subscriptionAmount?.message}
                  label={t("forms.subscriptionAmount")}
                  styles={appFieldStyles}
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
          <div className="flex justify-end gap-3 py-4 md:col-span-2">
            <button
              onClick={onClose}
              className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-transparent border-gray-500 border-[1px] border-solid rounded-[6px]"
              type="button"
            >
              <p className="text-[14px] text-black">{t("actions.cancel")}</p>
            </button>
            <button
              disabled={createMutation.isPending || updateMutation.isPending}
              type="submit"
              className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-brand rounded-[6px]"
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
