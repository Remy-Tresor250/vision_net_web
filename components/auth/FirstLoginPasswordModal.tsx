"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, PasswordInput, TextInput } from "@mantine/core";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useFirstLoginSetPasswordMutation,
  useFirstLoginStartMutation,
  useFirstLoginVerifyMutation,
} from "@/lib/query/hooks";
import {
  firstLoginPasswordSchema,
  type FirstLoginPasswordFormValues,
} from "@/lib/validation/auth";

interface Props {
  initialPhone?: string;
  opened: boolean;
  onClose: () => void;
  onSuccess?: (phone: string) => void;
}

export default function FirstLoginPasswordModal({
  initialPhone = "",
  onClose,
  onSuccess,
  opened,
}: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "code" | "password">("phone");
  const startMutation = useFirstLoginStartMutation();
  const verifyMutation = useFirstLoginVerifyMutation();
  const setPasswordMutation = useFirstLoginSetPasswordMutation();
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FirstLoginPasswordFormValues>({
    defaultValues: {
      code: "",
      otpSessionId: "",
      password: "",
      phone: initialPhone,
    },
    resolver: zodResolver(firstLoginPasswordSchema),
  });

  function close() {
    setStep("phone");
    reset({
      code: "",
      otpSessionId: "",
      password: "",
      phone: initialPhone,
    });
    onClose();
  }

  function start() {
    startMutation.mutate(
      { phone: getValues("phone") },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(
            response.developmentOtp
              ? `OTP: ${response.developmentOtp}`
              : response.message ?? t("settings.otpSent"),
          );
          setStep("code");
        },
      },
    );
  }

  function verify() {
    verifyMutation.mutate(
      { code: getValues("code") ?? "", phone: getValues("phone") },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          setValue("otpSessionId", response.otpSessionId);
          setStep("password");
        },
      },
    );
  }

  function setPassword(values: FirstLoginPasswordFormValues) {
    if (!values.otpSessionId) {
      toast.error(t("settings.verifyOtpFirst"));
      return;
    }

    setPasswordMutation.mutate(
      {
        otpSessionId: values.otpSessionId,
        password: values.password,
        phone: values.phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("auth.firstLoginCompleted"));
          onSuccess?.(values.phone);
          close();
        },
      },
    );
  }

  return (
    <Modal
      centered
      onClose={close}
      opened={opened}
      radius="sm"
      title={t("auth.setPassword")}
    >
      <form className="space-y-4" onSubmit={handleSubmit(setPassword)}>
        <p className="text-sm leading-6 text-text-muted">
          {t("auth.firstLoginHelp")}
        </p>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneNumberInput
              disabled={step !== "phone"}
              error={errors.phone?.message}
              label={t("auth.phone")}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        {step !== "phone" ? (
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
                disabled={step === "password"}
                error={errors.code?.message}
                label={t("settings.otpCode")}
                styles={appFieldStyles}
              />
            )}
          />
        ) : null}
        {step === "password" ? (
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                {...field}
                classNames={appFieldClassNames}
                error={errors.password?.message}
                label={t("auth.setPassword")}
                styles={appFieldStyles}
              />
            )}
          />
        ) : null}
        <div className="flex justify-end gap-3">
          <Button onClick={close} variant="outline">
            {t("actions.cancel")}
          </Button>
          {step === "phone" ? (
            <Button disabled={startMutation.isPending} onClick={start} type="button">
              {t("settings.requestOtp")}
            </Button>
          ) : step === "code" ? (
            <Button disabled={verifyMutation.isPending} onClick={verify} type="button">
              {t("settings.verifyOtp")}
            </Button>
          ) : (
            <Button disabled={setPasswordMutation.isPending} type="submit">
              {t("auth.setPassword")}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
