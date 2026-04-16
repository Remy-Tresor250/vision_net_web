"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi, type DashboardParams } from "@/lib/api/admin";
import {
  authApi,
  type ChangePasswordPayload,
  type ForgotPasswordResetPayload,
  type PasswordLoginPayload,
  type PhonePayload,
  type UpdateMePayload,
  type VerifyOtpPayload,
} from "@/lib/api/auth";
import type {
  AdminAgentsParams,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminPaymentsParams,
  CreateAdminUserPayload,
  CreateAgentPayload,
  CreateClientPayload,
  MarkPaymentCompletePayload,
  UpdateAgentPayload,
  UpdateClientPayload,
  UpdateStatusPayload,
} from "@/lib/api/types";
import {
  invalidateAgents,
  invalidateClients,
  invalidateDashboard,
  invalidatePayments,
} from "@/lib/query/invalidation";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

export function usePasswordLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: PasswordLoginPayload) => authApi.passwordLogin(payload),
    onSuccess: (session) => setSession(session),
  });
}

export function useForgotPasswordStartMutation() {
  return useMutation({
    mutationFn: (payload: PhonePayload) => authApi.forgotPasswordStart(payload),
  });
}

export function useForgotPasswordVerifyMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.forgotPasswordVerify(payload),
  });
}

export function useForgotPasswordResetMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordResetPayload) =>
      authApi.forgotPasswordReset(payload),
  });
}

export function useChangePasswordStartMutation() {
  return useMutation({
    mutationFn: (payload: PhonePayload) => authApi.changePasswordStart(payload),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
}

export function usePhoneChangeStartMutation() {
  return useMutation({
    mutationFn: (payload: PhonePayload) => authApi.phoneChangeStart(payload),
  });
}

export function usePhoneChangeVerifyMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.phoneChangeVerify(payload),
  });
}

export function useUpdateMeMutation() {
  return useMutation({
    mutationFn: (payload: UpdateMePayload) => authApi.updateMe(payload),
  });
}

export function useAdminDashboardQuery(params?: DashboardParams) {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(params),
    queryFn: () => adminApi.dashboard(params),
  });
}

export function useAdminClientsQuery(params?: AdminClientsParams) {
  return useQuery({
    queryKey: queryKeys.admin.clients.list(params),
    queryFn: () => adminApi.clients(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminClientQuery(clientId: string) {
  return useQuery({
    enabled: Boolean(clientId),
    queryKey: queryKeys.admin.clients.detail(clientId),
    queryFn: () => adminApi.client(clientId),
  });
}

export function useAdminClientPaymentsQuery(
  clientId: string,
  params?: AdminClientPaymentsParams,
) {
  return useQuery({
    enabled: Boolean(clientId),
    queryKey: queryKeys.admin.clients.payments(clientId, params),
    queryFn: () => adminApi.clientPayments(clientId, params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminAgentsQuery(params?: AdminAgentsParams) {
  return useQuery({
    queryKey: queryKeys.admin.agents.list(params),
    queryFn: () => adminApi.agents(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminAgentQuery(agentId: string) {
  return useQuery({
    enabled: Boolean(agentId),
    queryKey: queryKeys.admin.agents.detail(agentId),
    queryFn: () => adminApi.agent(agentId),
  });
}

export function useAdminPaymentsQuery(params?: AdminPaymentsParams) {
  return useQuery({
    queryKey: queryKeys.admin.payments.list(params),
    queryFn: () => adminApi.payments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminPaymentQuery(paymentId: string) {
  return useQuery({
    enabled: Boolean(paymentId),
    queryKey: queryKeys.admin.payments.detail(paymentId),
    queryFn: () => adminApi.payment(paymentId),
  });
}

export function useReceiptVerificationQuery(receiptId: string) {
  return useQuery({
    enabled: Boolean(receiptId),
    queryKey: queryKeys.admin.receipt.verification(receiptId),
    queryFn: () => adminApi.verifyReceipt(receiptId),
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminApi.createAdmin(payload),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => adminApi.createAgent(payload),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => adminApi.createClient(payload),
    onSuccess: () => invalidateClients(queryClient),
  });
}

export function useUpdateClientStatusMutation(clientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStatusPayload & { clientId?: string }) => {
      const targetClientId = payload.clientId ?? clientId;

      if (!targetClientId) {
        throw new Error("Missing client id.");
      }

      return adminApi.updateClientStatus(targetClientId, {
        isActive: payload.isActive,
      });
    },
    onSuccess: (_, payload) =>
      invalidateClients(queryClient, payload.clientId ?? clientId),
  });
}

export function useUpdateClientMutation(clientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateClientPayload & {
        clientId?: string;
      },
    ) => {
      const targetClientId = payload.clientId ?? clientId;

      if (!targetClientId) {
        throw new Error("Missing client id.");
      }

      const { clientId: _clientId, ...body } = payload;
      return adminApi.updateClient(targetClientId, body);
    },
    onSuccess: (_, payload) =>
      invalidateClients(queryClient, payload.clientId ?? clientId),
  });
}

export function useUpdateAgentStatusMutation(agentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStatusPayload & { agentId?: string }) => {
      const targetAgentId = payload.agentId ?? agentId;

      if (!targetAgentId) {
        throw new Error("Missing agent id.");
      }

      return adminApi.updateAgentStatus(targetAgentId, {
        isActive: payload.isActive,
      });
    },
    onSuccess: (_, payload) =>
      invalidateAgents(queryClient, payload.agentId ?? agentId),
  });
}

export function useUpdateAgentMutation(agentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateAgentPayload & {
        agentId?: string;
      },
    ) => {
      const targetAgentId = payload.agentId ?? agentId;

      if (!targetAgentId) {
        throw new Error("Missing agent id.");
      }

      const { agentId: _agentId, ...body } = payload;
      return adminApi.updateAgent(targetAgentId, body);
    },
    onSuccess: (_, payload) =>
      invalidateAgents(queryClient, payload.agentId ?? agentId),
  });
}

export function useMarkClientPaymentCompleteMutation(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkPaymentCompletePayload) =>
      adminApi.markClientPaymentComplete(clientId, payload),
    onSuccess: () => invalidatePayments(queryClient, clientId),
  });
}

export function useRunBillingDailyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminApi.runBillingDaily(),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useImportAgentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => adminApi.importAgents(file),
    onSuccess: () => invalidateAgents(queryClient),
  });
}

export function useImportClientsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => adminApi.importClients(file),
    onSuccess: () => invalidateClients(queryClient),
  });
}
