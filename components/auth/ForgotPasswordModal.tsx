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
  useForgotPasswordResetMutation,
  useForgotPasswordStartMutation,
  useForgotPasswordVerifyMutation,
} from "@/lib/query/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation/auth";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose, opened }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "code" | "password">("phone");
  const startMutation = useForgotPasswordStartMutation();
  const verifyMutation = useForgotPasswordVerifyMutation();
  const resetMutation = useForgotPasswordResetMutation();
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    setValue,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      code: "",
      otpSessionId: "",
      password: "",
      phone: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  function close() {
    setStep("phone");
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

  function reset(values: ForgotPasswordFormValues) {
    if (!values.otpSessionId) {
      toast.error(t("settings.verifyOtpFirst"));
      return;
    }

    resetMutation.mutate(
      {
        otpSessionId: values.otpSessionId,
        password: values.password,
        phone: values.phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("settings.passwordUpdated"));
          close();
        },
      },
    );
  }

  return (
    <Modal centered onClose={close} opened={opened} radius="sm" title={t("auth.resetPassword")}>
      <form className="space-y-4" onSubmit={handleSubmit(reset)}>
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
                label={t("settings.newPassword")}
                styles={appFieldStyles}
              />
            )}
          />
        ) : null}
        {step === "phone" ? (
          <Button disabled={startMutation.isPending} onClick={start} type="button">
            {t("settings.requestOtp")}
          </Button>
        ) : step === "code" ? (
          <Button disabled={verifyMutation.isPending} onClick={verify} type="button">
            {t("settings.verifyOtp")}
          </Button>
        ) : (
          <Button disabled={resetMutation.isPending} type="submit">
            {t("auth.resetPassword")}
          </Button>
        )}
      </form>
    </Modal>
  );
}
