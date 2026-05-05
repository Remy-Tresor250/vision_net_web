"use client";

import { PasswordInput, TextInput } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useUpdateMeMutation } from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPanel() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [fullNames, setFullNames] = useState(user?.fullNames ?? "");
  const updateMe = useUpdateMeMutation();

  function saveProfile() {
    updateMe.mutate(
      {
        fullNames,
        phone: user?.phone,
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          updateUser({ fullNames, phone: user?.phone });
          toast.success(t("settings.profileUpdated"));
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
            disabled
            label={t("common.phone")}
            onChange={() => undefined}
            value={user?.phone ?? ""}
          />
        </div>
        <p className="mt-3 text-sm text-text-muted">
          {t("settings.phoneChangeDisabledHelp")}
        </p>
        <div className="mt-5 flex gap-3">
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
          {t("settings.passwordChangeDisabledHelp")}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <PasswordInput
            classNames={appFieldClassNames}
            disabled
            label={t("settings.currentPassword")}
            onChange={() => undefined}
            styles={appFieldStyles}
            value=""
          />
          <PasswordInput
            classNames={appFieldClassNames}
            disabled
            label={t("settings.newPassword")}
            onChange={() => undefined}
            styles={appFieldStyles}
            value=""
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button disabled>
            {t("settings.changePassword")}
          </Button>
        </div>
      </section>
    </div>
  );
}
