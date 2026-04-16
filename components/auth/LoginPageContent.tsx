"use client";

import { useTranslation } from "react-i18next";

import AppLogo from "@/components/dashboard/AppLogo";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPageContent() {
  const { t } = useTranslation();

  return (
    <section className="grid w-full overflow-hidden rounded-sm border border-border bg-surface shadow-card lg:grid-cols-[1fr_440px]">
      <div className="hidden border-r border-border bg-surface-muted p-10 lg:flex lg:flex-col lg:justify-between">
        <AppLogo />
        <div className="max-w-lg">
          <p className="text-[42px] font-semibold leading-tight text-foreground">
            {t("auth.adminPanel")}
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-text-muted">
            {t("auth.adminWorkspace")}
          </p>
        </div>
      </div>
      <div className="px-6 py-8 sm:px-10 sm:py-12">
        <div className="mb-9 lg:hidden">
          <AppLogo />
        </div>
        <div className="mb-8">
          <p className="text-[30px] font-semibold text-foreground">
            {t("auth.title")}
          </p>
          <p className="mt-2 text-[14px] leading-6 text-text-muted">
            {t("auth.subtitle")}
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
