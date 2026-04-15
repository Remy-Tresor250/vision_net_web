"use client";

import { PasswordInput, TextInput } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordOtpSessionId, setPasswordOtpSessionId] = useState("");
  const changePasswordStart = useChangePasswordStartMutation();
  const changePassword = useChangePasswordMutation();
  const phoneChangeStart = usePhoneChangeStartMutation();
  const phoneChangeVerify = usePhoneChangeVerifyMutation();
  const updateMe = useUpdateMeMutation();

  function requestPasswordOtp() {
    changePasswordStart.mutate(
      { phone: user?.phone ?? phone },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(response.developmentOtp ? `OTP: ${response.developmentOtp}` : response.message ?? "OTP sent.");
        },
      },
    );
  }

  function savePassword() {
    if (!passwordOtpSessionId) {
      toast.error("Enter OTP session id.");
      return;
    }

    changePassword.mutate(
      {
        newPassword,
        oldPassword,
        otpSessionId: passwordOtpSessionId,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success("Password updated.");
          setOldPassword("");
          setNewPassword("");
          setPasswordOtpSessionId("");
        },
      },
    );
  }

  function requestPhoneOtp() {
    phoneChangeStart.mutate(
      { phone },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(response.developmentOtp ? `OTP: ${response.developmentOtp}` : response.message ?? "OTP sent.");
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
          toast.success("Phone OTP verified.");
        },
      },
    );
  }

  function saveProfile() {
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
          toast.success("Profile updated.");
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
            label="Noms"
            onChange={(event) => setFullNames(event.currentTarget.value)}
            value={fullNames}
          />
          <TextInput
            label={t("common.phone")}
            onChange={(event) => setPhone(event.currentTarget.value)}
            value={phone}
          />
          {phone !== user?.phone ? (
            <>
              <TextInput
                label={t("settings.otpCode")}
                onChange={(event) => setPhoneCode(event.currentTarget.value)}
                value={phoneCode}
              />
              <div className="flex items-end gap-2">
                <Button
                  disabled={phoneChangeStart.isPending}
                  onClick={requestPhoneOtp}
                  variant="outline"
                >
                  {t("settings.requestOtp")}
                </Button>
                <Button
                  disabled={phoneChangeVerify.isPending || phoneCode.length !== 6}
                  onClick={verifyPhoneOtp}
                  variant="subtle"
                >
                  Verify
                </Button>
              </div>
            </>
          ) : null}
        </div>
        <Button className="mt-5" disabled={updateMe.isPending} onClick={saveProfile}>
          {t("actions.save")}
        </Button>
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-foreground">
          {t("settings.changePassword")}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PasswordInput
            label={t("settings.currentPassword")}
            onChange={(event) => setOldPassword(event.currentTarget.value)}
            value={oldPassword}
          />
          <PasswordInput
            label={t("settings.newPassword")}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            value={newPassword}
          />
          <TextInput
            label="OTP session id"
            onChange={(event) => setPasswordOtpSessionId(event.currentTarget.value)}
            value={passwordOtpSessionId}
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            disabled={changePasswordStart.isPending}
            onClick={requestPasswordOtp}
            variant="outline"
          >
            {t("settings.requestOtp")}
          </Button>
          <Button disabled={changePassword.isPending} onClick={savePassword}>
            {t("settings.changePassword")}
          </Button>
        </div>
      </section>
    </div>
  );
}
