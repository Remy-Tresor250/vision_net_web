"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/client";
import { usePasswordLoginMutation } from "@/lib/query/hooks";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [forgotOpened, setForgotOpened] = useState(false);
  const searchParams = useSearchParams();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const mutation = usePasswordLoginMutation();
  const next = searchParams.get("next") ?? "/dashboard";

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormValues>({
    defaultValues: {
      password: "",
      phone: "",
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace(next);
    }
  }, [hasHydrated, next, router, token]);

  function onSubmit(values: LoginFormValues) {
    mutation.mutate(values, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: (session) => {
        if (session.user.role !== "ADMIN") {
          logout();
          toast.error(t("auth.adminOnly"));
          return;
        }

        toast.success(t("auth.welcome"));
        router.replace(next);
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <PhoneNumberInput
            error={errors.phone?.message}
            label={t("auth.phone")}
            onChange={field.onChange}
            placeholder="780000000"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <PasswordInput
            {...field}
            classNames={appFieldClassNames}
            error={errors.password?.message}
            label={t("auth.password")}
            placeholder={t("auth.passwordPlaceholder")}
            styles={appFieldStyles}
          />
        )}
      />
      <button
        className="-mt-2 text-[13px] font-medium text-brand"
        onClick={() => setForgotOpened(true)}
        type="button"
      >
        {t("auth.forgotPassword")}
      </button>
      <Button
        className="h-12 w-full"
        disabled={mutation.isPending}
        type="submit"
      >
        <HiOutlineArrowRightOnRectangle className="size-5" />
        {mutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
      <ForgotPasswordModal
        onClose={() => setForgotOpened(false)}
        opened={forgotOpened}
      />
    </form>
  );
}
