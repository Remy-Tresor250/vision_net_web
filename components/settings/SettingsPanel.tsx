"use client";

import { Modal, PasswordInput, TextInput } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useChangePasswordMutation,
  useChangePasswordStartMutation,
  usePhoneChangeStartMutation,
  usePhoneChangeVerifyMutation,
  useUpdateMeMutation,
} from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPanel() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [fullNames, setFullNames] = useState(user?.fullNames ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneOtpSessionId, setPhoneOtpSessionId] = useState("");
  const [phoneOtpOpened, setPhoneOtpOpened] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordOtpValue, setPasswordOtpValue] = useState("");
  const [passwordOtpOpened, setPasswordOtpOpened] = useState(false);
  const changePasswordStart = useChangePasswordStartMutation();
  const changePassword = useChangePasswordMutation();
  const phoneChangeStart = usePhoneChangeStartMutation();
  const phoneChangeVerify = usePhoneChangeVerifyMutation();
  const updateMe = useUpdateMeMutation();

  function handlePhoneChange(value: string) {
    setPhone(value);
    setPhoneCode("");
    setPhoneOtpSessionId("");
  }

  function requestPasswordOtp() {
    if (!oldPassword || oldPassword.length < 8) {
      toast.error(t("settings.enterCurrentPassword"));
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error(t("settings.enterValidNewPassword"));
      return;
    }

    changePasswordStart.mutate(
      { phone: user?.phone ?? phone },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(
            response.developmentOtp
              ? `OTP: ${response.developmentOtp}`
              : response.message ?? t("settings.otpSent"),
          );
          setPasswordOtpOpened(true);
        },
      },
    );
  }

  function confirmPasswordChange() {
    if (!passwordOtpValue.trim()) {
      toast.error(t("settings.enterOtp"));
      return;
    }

    changePassword.mutate(
      {
        newPassword,
        oldPassword,
        otpSessionId: passwordOtpValue.trim(),
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("settings.passwordUpdated"));
          setOldPassword("");
          setNewPassword("");
          setPasswordOtpValue("");
          setPasswordOtpOpened(false);
        },
      },
    );
  }

  function requestPhoneOtp() {
    if (!phone || phone === user?.phone) {
      toast.error(t("settings.enterNewPhoneFirst"));
      return;
    }

    phoneChangeStart.mutate(
      { phone },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(
            response.developmentOtp
              ? `OTP: ${response.developmentOtp}`
              : response.message ?? t("settings.otpSent"),
          );
          setPhoneOtpOpened(true);
        },
      },
    );
  }

  function verifyPhoneOtp() {
    phoneChangeVerify.mutate(
      { code: phoneCode, phone },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          setPhoneOtpSessionId(response.otpSessionId);
          toast.success(t("settings.phoneOtpVerified"));
          setPhoneCode("");
          setPhoneOtpOpened(false);
        },
      },
    );
  }

  function saveProfile() {
    if (phone !== user?.phone && !phoneOtpSessionId) {
      toast.error(t("settings.verifyPhoneBeforeSaving"));
      return;
    }

    updateMe.mutate(
      {
        fullNames,
        otpSessionId: phone !== user?.phone ? phoneOtpSessionId : undefined,
        phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          updateUser({ fullNames, phone });
          toast.success(t("settings.profileUpdated"));
          setPhoneCode("");
          setPhoneOtpSessionId("");
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-sm border border-border bg-surface p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-foreground">
          {t("settings.profile")}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput
            classNames={appFieldClassNames}
            label={t("settings.names")}
            onChange={(event) => setFullNames(event.currentTarget.value)}
            styles={appFieldStyles}
            value={fullNames}
          />
          <PhoneNumberInput
            label={t("common.phone")}
            onChange={handlePhoneChange}
            value={phone}
          />
        </div>
        <div className="mt-5 flex gap-3">
          {phone !== user?.phone ? (
            <Button
              disabled={phoneChangeStart.isPending || phoneChangeVerify.isPending}
              onClick={requestPhoneOtp}
              variant="outline"
            >
              {t("settings.requestOtp")}
            </Button>
          ) : null}
          <Button disabled={updateMe.isPending} onClick={saveProfile}>
            {t("actions.save")}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-foreground">
          {t("settings.changePassword")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {t("settings.changePasswordHelp")}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <PasswordInput
            classNames={appFieldClassNames}
            label={t("settings.currentPassword")}
            onChange={(event) => setOldPassword(event.currentTarget.value)}
            styles={appFieldStyles}
            value={oldPassword}
          />
          <PasswordInput
            classNames={appFieldClassNames}
            label={t("settings.newPassword")}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            styles={appFieldStyles}
            value={newPassword}
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            disabled={changePasswordStart.isPending || changePassword.isPending}
            onClick={requestPasswordOtp}
          >
            {t("settings.changePassword")}
          </Button>
        </div>
      </section>

      <Modal
        centered
        onClose={() => {
          if (!phoneChangeVerify.isPending) {
            setPhoneOtpOpened(false);
            setPhoneCode("");
          }
        }}
        opened={phoneOtpOpened}
        radius="sm"
        title={t("settings.confirmPhoneChange")}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-muted">
            {t("settings.confirmPhoneChangeHelp")}
          </p>
          <TextInput
            classNames={appFieldClassNames}
            label={t("settings.otpCode")}
            onChange={(event) => setPhoneCode(event.currentTarget.value)}
            styles={appFieldStyles}
            value={phoneCode}
          />
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setPhoneOtpOpened(false);
                setPhoneCode("");
              }}
              variant="outline"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              disabled={phoneChangeVerify.isPending || phoneCode.length !== 6}
              onClick={verifyPhoneOtp}
            >
              {phoneChangeVerify.isPending
                ? t("forms.saving")
                : t("settings.confirmPhoneChange")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        centered
        onClose={() => {
          if (!changePassword.isPending) {
            setPasswordOtpOpened(false);
            setPasswordOtpValue("");
          }
        }}
        opened={passwordOtpOpened}
        radius="sm"
        title={t("settings.confirmPasswordChange")}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-muted">
            {t("settings.confirmPasswordChangeHelp")}
          </p>
          <TextInput
            classNames={appFieldClassNames}
            label={t("settings.otpCode")}
            onChange={(event) => setPasswordOtpValue(event.currentTarget.value)}
            styles={appFieldStyles}
            value={passwordOtpValue}
          />
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setPasswordOtpOpened(false);
                setPasswordOtpValue("");
              }}
              variant="outline"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              disabled={changePassword.isPending}
              onClick={confirmPasswordChange}
            >
              {changePassword.isPending ? t("forms.saving") : t("settings.confirmPasswordChange")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
