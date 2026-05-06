"use client";

import { PasswordInput, TextInput } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useChangePasswordMutation,
  useUpdateMeMutation,
} from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPanel() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [fullNames, setFullNames] = useState(user?.fullNames ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const updateMe = useUpdateMeMutation();
  const changePassword = useChangePasswordMutation();

  function saveProfile() {
    updateMe.mutate(
      {
        fullNames,
        phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          updateUser({ fullNames, phone });
          toast.success(t("settings.profileUpdated"));
        },
      },
    );
  }

  function savePassword() {
    if (!oldPassword.trim()) {
      toast.error(t("settings.enterCurrentPassword"));
      return;
    }

    if (newPassword.trim().length < 8) {
      toast.error(t("settings.enterValidNewPassword"));
      return;
    }

    changePassword.mutate(
      {
        oldPassword,
        newPassword,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          toast.success(t("settings.passwordUpdated"));
        },
      },
    );
  }

  const isSavingProfile = updateMe.isPending;
  const isSavingPassword = changePassword.isPending;

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
            onChange={setPhone}
            value={phone}
          />
        </div>
        <p className="mt-3 text-sm text-text-muted">
          {t("settings.phoneChangeHelp")}
        </p>
        <div className="mt-5 flex gap-3">
          <Button disabled={isSavingProfile} onClick={saveProfile}>
            {t("actions.save")}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-foreground">
          {t("settings.changePassword")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {t("settings.passwordChangeHelp")}
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
          <Button disabled={isSavingPassword} onClick={savePassword}>
            {t("settings.changePassword")}
          </Button>
        </div>
      </section>
    </div>
  );
}
