"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Select, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";

import ImportUsersModal from "@/components/dashboard/ImportUsersModal";
import { getApiErrorMessage } from "@/lib/api/client";
import { useCreateAgentMutation } from "@/lib/query/hooks";
import {
  agentFormSchema,
  type AgentFormValues,
} from "@/lib/validation/admin-users";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export default function AddAgentModal({ onClose, opened }: Props) {
  const mutation = useCreateAgentMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AgentFormValues>({
    defaultValues: {
      fullNames: "",
      language: "fr",
      phone: "",
    },
    resolver: zodResolver(agentFormSchema),
  });

  function submit(values: AgentFormValues) {
    mutation.mutate(values, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: () => {
        toast.success("Agent created.");
        reset();
        onClose();
      },
    });
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
          Enregistrer Agent(s)
        </span>
      }
    >
      <div className="space-y-4">
        <ImportUsersModal kind="agents" onImported={onClose} />
        <div className="flex items-center gap-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[13px] text-text-muted">Ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <Controller
            control={control}
            name="fullNames"
            render={({ field }) => (
              <TextInput
                {...field}
                error={errors.fullNames?.message}
                label="Noms complets"
                placeholder="Ex: Jean bosco ..."
                styles={{
                  input: {
                    height: 40,
                    paddingRight: 12,
                    paddingLeft: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Ex: +2507xxxx"
                styles={{
                  input: {
                    height: 40,
                    paddingRight: 12,
                    paddingLeft: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                }}
                error={errors.phone?.message}
                label="Telephone"
              />
            )}
          />
          <Controller
            control={control}
            name="language"
            render={({ field }) => (
              <Select
                data={[
                  { label: "English", value: "en" },
                  { label: "French", value: "fr" },
                ]}
                styles={{
                  input: {
                    height: 40,
                    paddingRight: 12,
                    paddingLeft: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                }}
                error={errors.language?.message}
                label="Langue"
                onChange={(value) => field.onChange(value ?? "en")}
                value={field.value}
              />
            )}
          />

          <div className="flex justify-end gap-3 py-4">
            <button
              onClick={onClose}
              className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-transparent border-gray-500 border-[1px] border-solid rounded-[6px]"
            >
              <p className="text-[14px] text-black">Annuler</p>
            </button>
            <button
              disabled={mutation.isPending}
              type="submit"
              className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-brand rounded-[6px]"
            >
              <p className="text-[14px] text-white">
                {mutation.isPending ? "Creation..." : "Enregistrer agent"}
              </p>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
