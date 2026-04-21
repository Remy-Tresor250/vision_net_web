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
  AdminLocationsParams,
  AdminServiceTypesParams,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminPaymentsParams,
  AssignAgentAvenuesPayload,
  CreateAvenuePayload,
  CreateAdminUserPayload,
  CreateAgentPayload,
  CreateClientPayload,
  CreateQuartierPayload,
  CreateSerinePayload,
  CreateServiceTypePayload,
  GenerateAvenueMonthlyReportPayload,
  MarkPaymentCompletePayload,
  UpdateAvenuePayload,
  UpdateCommissionConfigPayload,
  UpdateAgentPayload,
  UpdateClientPayload,
  UpdateServiceTypePayload,
  UpdateStatusPayload,
} from "@/lib/api/types";
import {
  invalidateAgents,
  invalidateClients,
  invalidateCommissions,
  invalidateDashboard,
  invalidateLocations,
  invalidatePayments,
  invalidateReports,
  invalidateServiceTypes,
} from "@/lib/query/invalidation";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

interface QueryConfig {
  enabled?: boolean;
}

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
    queryFn: ({ signal }) => adminApi.dashboard(params, { signal }),
  });
}

export function useAdminServiceTypesQuery(
  params?: AdminServiceTypesParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.serviceTypes.list(params),
    queryFn: ({ signal }) => adminApi.serviceTypes(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminQuartiersQuery(
  params?: AdminLocationsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.locations.quartiers(params),
    queryFn: ({ signal }) => adminApi.quartiers(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminSerinesQuery(
  params?: AdminLocationsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.locations.serines(params),
    queryFn: ({ signal }) => adminApi.serines(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminAvenuesQuery(
  params?: AdminLocationsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.locations.avenues(params),
    queryFn: ({ signal }) => adminApi.avenues(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useCommissionConfigQuery(config?: QueryConfig) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.commissions.config(),
    queryFn: ({ signal }) => adminApi.commissionConfig({ signal }),
  });
}

export function useAvenueMonthlyReportStatusQuery(
  reportId: string,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: Boolean(reportId) && config?.enabled !== false,
    queryKey: queryKeys.admin.reports.avenueMonthlyStatus(reportId),
    queryFn: ({ signal }) => adminApi.avenueMonthlyReportStatus(reportId, { signal }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!reportId) return false;
      if (status === "COMPLETED" || status === "FAILED") return false;

      return 2500;
    },
  });
}

export function useAdminClientsQuery(
  params?: AdminClientsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.clients.list(params),
    queryFn: ({ signal }) => adminApi.clients(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminClientQuery(clientId: string) {
  return useQuery({
    enabled: Boolean(clientId),
    queryKey: queryKeys.admin.clients.detail(clientId),
    queryFn: ({ signal }) => adminApi.client(clientId, { signal }),
  });
}

export function useAdminClientPaymentsQuery(
  clientId: string,
  params?: AdminClientPaymentsParams,
) {
  return useQuery({
    enabled: Boolean(clientId),
    queryKey: queryKeys.admin.clients.payments(clientId, params),
    queryFn: ({ signal }) => adminApi.clientPayments(clientId, params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminAgentsQuery(
  params?: AdminAgentsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.agents.list(params),
    queryFn: ({ signal }) => adminApi.agents(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminAgentQuery(agentId: string) {
  return useQuery({
    enabled: Boolean(agentId),
    queryKey: queryKeys.admin.agents.detail(agentId),
    queryFn: ({ signal }) => adminApi.agent(agentId, { signal }),
  });
}

export function useAdminPaymentsQuery(
  params?: AdminPaymentsParams,
  config?: QueryConfig,
) {
  return useQuery({
    enabled: config?.enabled,
    queryKey: queryKeys.admin.payments.list(params),
    queryFn: ({ signal }) => adminApi.payments(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminPaymentQuery(paymentId: string) {
  return useQuery({
    enabled: Boolean(paymentId),
    queryKey: queryKeys.admin.payments.detail(paymentId),
    queryFn: ({ signal }) => adminApi.payment(paymentId, { signal }),
  });
}

export function useAdminPaymentReceiptDataQuery(paymentId: string) {
  return useQuery({
    enabled: Boolean(paymentId),
    queryKey: queryKeys.admin.payments.receiptData(paymentId),
    queryFn: ({ signal }) => adminApi.paymentReceiptData(paymentId, { signal }),
  });
}

export function useReceiptVerificationQuery(receiptId: string) {
  return useQuery({
    enabled: Boolean(receiptId),
    queryKey: queryKeys.admin.receipt.verification(receiptId),
    queryFn: ({ signal }) => adminApi.verifyReceipt(receiptId, { signal }),
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminApi.createAdmin(payload),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useCreateServiceTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceTypePayload) =>
      adminApi.createServiceType(payload),
    onSuccess: () => invalidateServiceTypes(queryClient),
  });
}

export function useUpdateServiceTypeMutation(serviceTypeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateServiceTypePayload & {
        serviceTypeId?: string;
      },
    ) => {
      const targetServiceTypeId = payload.serviceTypeId ?? serviceTypeId;

      if (!targetServiceTypeId) {
        throw new Error("Missing service type id.");
      }

      const { serviceTypeId: _serviceTypeId, ...body } = payload;

      return adminApi.updateServiceType(targetServiceTypeId, body);
    },
    onSuccess: () => invalidateServiceTypes(queryClient),
  });
}

export function useDeleteServiceTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeId: string) => adminApi.deleteServiceType(serviceTypeId),
    onSuccess: () => invalidateServiceTypes(queryClient),
  });
}

export function useCreateAvenueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAvenuePayload) => adminApi.createAvenue(payload),
    onSuccess: () => invalidateLocations(queryClient),
  });
}

export function useCreateQuartierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuartierPayload) => adminApi.createQuartier(payload),
    onSuccess: () => invalidateLocations(queryClient),
  });
}

export function useCreateSerineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSerinePayload) => adminApi.createSerine(payload),
    onSuccess: () => invalidateLocations(queryClient),
  });
}

export function useUpdateAvenueMutation(avenueId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateAvenuePayload & {
        avenueId?: string;
      },
    ) => {
      const targetAvenueId = payload.avenueId ?? avenueId;

      if (!targetAvenueId) {
        throw new Error("Missing avenue id.");
      }

      const { avenueId: _avenueId, ...body } = payload;

      return adminApi.updateAvenue(targetAvenueId, body);
    },
    onSuccess: () => invalidateLocations(queryClient),
  });
}

export function useUpdateCommissionConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommissionConfigPayload) =>
      adminApi.updateCommissionConfig(payload),
    onSuccess: () => invalidateCommissions(queryClient),
  });
}

export function useAssignAgentAvenuesMutation(agentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: AssignAgentAvenuesPayload & {
        agentId?: string;
      },
    ) => {
      const targetAgentId = payload.agentId ?? agentId;

      if (!targetAgentId) {
        throw new Error("Missing agent id.");
      }

      return adminApi.assignAgentAvenues(targetAgentId, {
        avenueIds: payload.avenueIds,
      });
    },
    onSuccess: (_, payload) =>
      invalidateAgents(queryClient, payload.agentId ?? agentId),
  });
}

export function useGenerateAvenueMonthlyReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateAvenueMonthlyReportPayload) =>
      adminApi.generateAvenueMonthlyReport(payload),
    onSuccess: (data) => invalidateReports(queryClient, data.reportId),
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
