"use client";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiSuccess,
  AuthMeResponse,
  AuthTokenPayload,
  AuthUser,
  Language,
  OtpStartResponse,
  OtpVerifyResponse,
} from "@/lib/api/types";

export interface PhonePayload {
  phone: string;
}

export interface VerifyOtpPayload extends PhonePayload {
  code: string;
}

export interface SetPasswordPayload extends PhonePayload {
  otpSessionId: string;
  password: string;
}

export interface PasswordLoginPayload extends PhonePayload {
  password: string;
}

export type ForgotPasswordResetPayload = SetPasswordPayload;

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateMePayload {
  fullNames?: string;
  phone?: string;
}

export interface PushTokenPayload {
  expoPushToken: string;
}

export interface UpdateLanguagePayload {
  language: Language;
}

function normalizeAuthMeResponse(payload: AuthMeResponse): AuthUser {
  const profile = payload.profile;

  return {
    ...payload.user,
    profile,
    profileType: profile?.type ?? payload.user.profileType,
    adminId: profile?.adminId ?? payload.user.adminId,
    adminRoleId: profile?.roleId ?? payload.user.adminRoleId,
    roleName: profile?.roleName ?? payload.user.roleName,
    permissions: profile?.permissions ?? payload.user.permissions ?? [],
  };
}

export const authApi = {
  firstLoginStart: (payload: PhonePayload) =>
    api.post<OtpStartResponse>(endpoints.auth.firstLoginStart, payload).then((res) => res.data),
  firstLoginVerify: (payload: VerifyOtpPayload) =>
    api.post<OtpVerifyResponse>(endpoints.auth.firstLoginVerify, payload).then((res) => res.data),
  firstLoginSetPassword: (payload: SetPasswordPayload) =>
    api
      .post<AuthTokenPayload>(endpoints.auth.firstLoginSetPassword, payload)
      .then((res) => res.data),
  passwordLogin: (payload: PasswordLoginPayload) =>
    api.post<AuthTokenPayload>(endpoints.auth.passwordLogin, payload).then((res) => res.data),
  otpLoginStart: (payload: PhonePayload) =>
    api.post<OtpStartResponse>(endpoints.auth.otpLoginStart, payload).then((res) => res.data),
  otpLoginVerify: (payload: VerifyOtpPayload) =>
    api.post<AuthTokenPayload>(endpoints.auth.otpLoginVerify, payload).then((res) => res.data),
  forgotPasswordStart: (payload: PhonePayload) =>
    api
      .post<OtpStartResponse>(endpoints.auth.forgotPasswordStart, payload)
      .then((res) => res.data),
  forgotPasswordVerify: (payload: VerifyOtpPayload) =>
    api
      .post<OtpVerifyResponse>(endpoints.auth.forgotPasswordVerify, payload)
      .then((res) => res.data),
  forgotPasswordReset: (payload: ForgotPasswordResetPayload) =>
    api.post<ApiSuccess>(endpoints.auth.forgotPasswordReset, payload).then((res) => res.data),
  changePassword: (payload: ChangePasswordPayload) =>
    api.post<ApiSuccess>(endpoints.auth.changePassword, payload).then((res) => res.data),
  me: () =>
    api
      .get<AuthMeResponse>(endpoints.me.detail)
      .then((res) => normalizeAuthMeResponse(res.data)),
  updateLanguage: (payload: UpdateLanguagePayload) =>
    api.patch<unknown>(endpoints.me.language, payload).then((res) => res.data),
  updateMe: (payload: UpdateMePayload) =>
    api.patch<unknown>(endpoints.me.detail, payload).then((res) => res.data),
  pushToken: (payload: PushTokenPayload) =>
    api.post<ApiSuccess>(endpoints.auth.pushToken, payload).then((res) => res.data),
};
