"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import ImportUsersModal from "@/components/dashboard/ImportUsersModal";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useCreateAgentMutation,
  useUpdateAgentMutation,
} from "@/lib/query/hooks";
import {
  agentFormSchema,
  type AgentFormValues,
} from "@/lib/validation/admin-users";
import type { AdminAgentDetail, AdminAgentListItem } from "@/lib/api/types";

interface Props {
  opened: boolean;
  onClose: () => void;
  agent?: Pick<
    AdminAgentListItem | AdminAgentDetail,
    "agentId" | "fullNames" | "isActive" | "phone"
  > | null;
}

export default function AddAgentModal({ agent, onClose, opened }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreateAgentMutation();
  const updateMutation = useUpdateAgentMutation(agent?.agentId);
  const isEditing = Boolean(agent);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AgentFormValues>({
    defaultValues: {
      fullNames: "",
      phone: "",
    },
    resolver: zodResolver(agentFormSchema),
  });

  useEffect(() => {
    if (!opened) return;

    reset({
      fullNames: agent?.fullNames ?? "",
      phone: agent?.phone ?? "",
    });
  }, [agent, opened, reset]);

  function submit(values: AgentFormValues) {
    if (isEditing) {
      updateMutation.mutate(values, {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("forms.agentUpdated"));
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
          toast.success(t("forms.agentCreated"));
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
          {isEditing ? t("forms.editAgentTitle") : t("modals.registerAgents")}
        </span>
      }
    >
      <div className="space-y-4 lg:px-6">
        {!isEditing ? (
          <>
            <ImportUsersModal kind="agents" onImported={onClose} />
            <div className="flex items-center gap-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[13px] text-text-muted">
                {t("common.or")}
              </span>
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
                    : t("actions.createAgent")}
              </p>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
