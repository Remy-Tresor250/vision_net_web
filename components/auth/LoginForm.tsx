"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineArrowRightOnRectangle, HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import FirstLoginPasswordModal from "@/components/auth/FirstLoginPasswordModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import OtpLoginModal from "@/components/auth/OtpLoginModal";
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
  const [forgotOpened, setForgotOpened] = useState(false);
  const [otpLoginOpened, setOtpLoginOpened] = useState(false);
  const [firstLoginOpened, setFirstLoginOpened] = useState(false);
  const [firstLoginPhone, setFirstLoginPhone] = useState("");
  const searchParams = useSearchParams();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const mutation = usePasswordLoginMutation();
  const next = searchParams.get("next") ?? "/dashboard";

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
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

    if (payload?.firstLoginRequired || payload?.code === "FIRST_LOGIN_REQUIRED") {
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
          setFirstLoginPhone(values.phone);
          setFirstLoginOpened(true);
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
      <Button
        className="h-12 w-full"
        onClick={() => setOtpLoginOpened(true)}
        type="button"
        variant="outline"
      >
        <HiOutlineDevicePhoneMobile className="size-5" />
        {t("auth.loginWithOtp")}
      </Button>
      <ForgotPasswordModal
        onClose={() => setForgotOpened(false)}
        opened={forgotOpened}
      />
      <OtpLoginModal
        initialPhone={getValues("phone")}
        onClose={() => setOtpLoginOpened(false)}
        onLoginSuccess={(session) => {
          if (session.user.role !== "ADMIN") {
            logout();
            toast.error(t("auth.adminOnly"));
            return;
          }

          setSession(session);
          toast.success(t("auth.welcome"));
          router.replace(next);
        }}
        opened={otpLoginOpened}
      />
      <FirstLoginPasswordModal
        key={`first-login-${firstLoginOpened ? "open" : "closed"}-${firstLoginPhone || getValues("phone")}`}
        initialPhone={firstLoginPhone || getValues("phone")}
        onClose={() => setFirstLoginOpened(false)}
        onSuccess={(phone) => {
          setFirstLoginPhone(phone);
          setFirstLoginOpened(false);
          toast.success(t("auth.passwordReadyForLogin"));
        }}
        opened={firstLoginOpened}
      />
    </form>
  );
}
