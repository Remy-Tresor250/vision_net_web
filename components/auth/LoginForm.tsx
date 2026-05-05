"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import Button from "@/components/ui/Button";
import { getApiErrorMessage, getApiErrorPayload } from "@/lib/api/client";
import { usePasswordLoginMutation } from "@/lib/query/hooks";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
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
    if (hasHydrated && token && user?.role === "ADMIN") {
      router.replace(next);
    }
  }, [hasHydrated, next, router, token, user?.role]);

  function isPasswordNotSetupError(error: unknown) {
    const payload = getApiErrorPayload(error);
    const message = getApiErrorMessage(error).toLowerCase();

    if (
      payload?.firstLoginRequired ||
      payload?.code === "FIRST_LOGIN_REQUIRED"
    ) {
      return true;
    }

    return [
      "password not setup",
      "password not set up",
      "password not configured",
      "password has not been set",
      "terminer la configuration du premier mot de passe",
      "mot de passe non defini",
      "mot de passe non défini",
      "mot de passe pas encore defini",
      "mot de passe pas encore défini",
      "define password first",
      "set password first",
    ].some((pattern) => message.includes(pattern));
  }

  function onSubmit(values: LoginFormValues) {
    mutation.mutate(values, {
      onError: (error) => {
        if (isPasswordNotSetupError(error)) {
          toast.error(t("auth.firstLoginRequired"));
          return;
        }

        toast.error(getApiErrorMessage(error));
      },
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
      <Button
        className="h-12 w-full"
        disabled={mutation.isPending}
        type="submit"
      >
        <HiOutlineArrowRightOnRectangle className="size-5" />
        {mutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  );
}
