"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, TextInput } from "@mantine/core";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useOtpLoginStartMutation,
  useOtpLoginVerifyMutation,
} from "@/lib/query/hooks";
import {
  otpLoginSchema,
  type OtpLoginFormValues,
} from "@/lib/validation/auth";

interface Props {
  initialPhone?: string;
  onClose: () => void;
  onLoginSuccess: (session: {
    accessToken: string;
    expiresInSeconds: number;
    tokenType: "Bearer";
    user: {
      id: string;
      fullNames: string;
      phone: string;
      role: "ADMIN" | "AGENT" | "CLIENT";
      language: "en" | "fr";
      firstLoginCompleted: boolean;
    };
  }) => void;
  opened: boolean;
}

export default function OtpLoginModal({
  initialPhone = "",
  onClose,
  onLoginSuccess,
  opened,
}: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const startMutation = useOtpLoginStartMutation();
  const verifyMutation = useOtpLoginVerifyMutation();
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<OtpLoginFormValues>({
    defaultValues: {
      code: "",
      phone: initialPhone,
    },
    resolver: zodResolver(otpLoginSchema),
  });

  function close() {
    setStep("phone");
    reset({
      code: "",
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

  function verify(values: OtpLoginFormValues) {
    verifyMutation.mutate(
      {
        code: values.code ?? "",
        phone: values.phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (session) => {
          onLoginSuccess(session);
          close();
        },
      },
    );
  }

  return (
    <Modal centered onClose={close} opened={opened} radius="sm" title={t("auth.loginWithOtp")}>
      <form className="space-y-4" onSubmit={handleSubmit(verify)}>
        <p className="text-sm leading-6 text-text-muted">
          {t("auth.otpLoginHelp")}
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
        {step === "code" ? (
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <TextInput
                {...field}
                classNames={appFieldClassNames}
                error={errors.code?.message}
                label={t("settings.otpCode")}
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
          ) : (
            <Button disabled={verifyMutation.isPending} type="submit">
              {t("auth.continueWithOtp")}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
