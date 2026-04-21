"use client";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AdminAgentDetail,
  AdminAgentListItem,
  AdminAgentsParams,
  AdminLocationsParams,
  AdminServiceType,
  AdminServiceTypesParams,
  AdminClientDetail,
  AdminClientListItem,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPaymentsParams,
  AssignAgentAvenuesPayload,
  Avenue,
  AvenueMonthlyReportJob,
  AvenueMonthlyReportStatus,
  ApiSuccess,
  CommissionConfig,
  CommissionDetailItem,
  CommissionSummaryItem,
  CommissionSummaryParams,
  CreateAvenuePayload,
  CreateAdminUserPayload,
  CreateAgentPayload,
  CreateClientPayload,
  CreateQuartierPayload,
  CreateSerinePayload,
  CreateServiceTypePayload,
  DashboardResponse,
  GenerateAvenueMonthlyReportPayload,
  ImportReport,
  MarkPaymentCompletePayload,
  PageResponse,
  PaymentResponse,
  Quartier,
  ReceiptData,
  ReceiptVerification,
  Serine,
  UpdateAvenuePayload,
  UpdateCommissionConfigPayload,
  UpdateStatusPayload,
  UpdateAgentPayload,
  UpdateClientPayload,
  UpdateQuartierPayload,
  UpdateSerinePayload,
  UpdateServiceTypePayload,
  UserSummary,
} from "@/lib/api/types";

export interface DashboardParams {
  year?: number;
  topAgentsLimit?: number;
}

interface RequestConfig {
  signal?: AbortSignal;
}

function downloadFile(path: string) {
  return api.get<Blob>(path, { responseType: "blob" }).then((res) => res.data);
}

function uploadFile(path: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<ImportReport>(path, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export const adminApi = {
  dashboard: (params?: DashboardParams, config?: RequestConfig) =>
    api
      .get<DashboardResponse>(endpoints.admin.dashboard, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createAdmin: (payload: CreateAdminUserPayload) =>
    api.post<UserSummary>(endpoints.admin.admins, payload).then((res) => res.data),
  serviceTypes: (params?: AdminServiceTypesParams, config?: RequestConfig) =>
    api
      .get<PageResponse<AdminServiceType>>(endpoints.admin.serviceTypes, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createServiceType: (payload: CreateServiceTypePayload) =>
    api
      .post<AdminServiceType>(endpoints.admin.serviceTypes, payload)
      .then((res) => res.data),
  updateServiceType: (serviceTypeId: string, payload: UpdateServiceTypePayload) =>
    api
      .patch<AdminServiceType>(endpoints.admin.serviceType(serviceTypeId), payload)
      .then((res) => res.data),
  deleteServiceType: (serviceTypeId: string) =>
    api
      .delete<ApiSuccess>(endpoints.admin.serviceType(serviceTypeId))
      .then((res) => res.data),
  quartiers: (params?: AdminLocationsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<Quartier>>(endpoints.admin.quartiers, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createQuartier: (payload: CreateQuartierPayload) =>
    api.post<Quartier>(endpoints.admin.quartiers, payload).then((res) => res.data),
  updateQuartier: (quartierId: string, payload: UpdateQuartierPayload) =>
    api
      .patch<Quartier>(endpoints.admin.quartier(quartierId), payload)
      .then((res) => res.data),
  deleteQuartier: (quartierId: string) =>
    api
      .delete<ApiSuccess>(endpoints.admin.quartier(quartierId))
      .then((res) => res.data),
  serines: (params?: AdminLocationsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<Serine>>(endpoints.admin.serines, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createSerine: (payload: CreateSerinePayload) =>
    api.post<Serine>(endpoints.admin.serines, payload).then((res) => res.data),
  updateSerine: (serineId: string, payload: UpdateSerinePayload) =>
    api
      .patch<Serine>(endpoints.admin.serine(serineId), payload)
      .then((res) => res.data),
  deleteSerine: (serineId: string) =>
    api
      .delete<ApiSuccess>(endpoints.admin.serine(serineId))
      .then((res) => res.data),
  avenues: (params?: AdminLocationsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<Avenue>>(endpoints.admin.avenues, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createAvenue: (payload: CreateAvenuePayload) =>
    api.post<Avenue>(endpoints.admin.avenues, payload).then((res) => res.data),
  updateAvenue: (avenueId: string, payload: UpdateAvenuePayload) =>
    api
      .patch<Avenue>(endpoints.admin.avenue(avenueId), payload)
      .then((res) => res.data),
  deleteAvenue: (avenueId: string) =>
    api
      .delete<ApiSuccess>(endpoints.admin.avenue(avenueId))
      .then((res) => res.data),
  commissionConfig: (config?: RequestConfig) =>
    api
      .get<CommissionConfig>(endpoints.admin.commissionConfig, {
        signal: config?.signal,
      })
      .then((res) => res.data),
  updateCommissionConfig: (payload: UpdateCommissionConfigPayload) =>
    api
      .patch<CommissionConfig>(endpoints.admin.commissionConfig, payload)
      .then((res) => res.data),
  commissionSummary: (params?: CommissionSummaryParams, config?: RequestConfig) =>
    api
      .get<PageResponse<CommissionSummaryItem>>(endpoints.admin.commissionSummary, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  commissionDetails: (params?: CommissionSummaryParams, config?: RequestConfig) =>
    api
      .get<PageResponse<CommissionDetailItem>>(endpoints.admin.commissionDetails, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  createAgent: (payload: CreateAgentPayload) =>
    api.post<UserSummary>(endpoints.admin.createAgent, payload).then((res) => res.data),
  createClient: (payload: CreateClientPayload) =>
    api.post<UserSummary>(endpoints.admin.createClient, payload).then((res) => res.data),
  clients: (params?: AdminClientsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<AdminClientListItem>>(endpoints.admin.clients, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  client: (clientId: string, config?: RequestConfig) =>
    api
      .get<AdminClientDetail>(endpoints.admin.client(clientId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  updateClient: (clientId: string, payload: UpdateClientPayload) =>
    api
      .patch<AdminClientDetail>(endpoints.admin.client(clientId), payload)
      .then((res) => res.data),
  updateClientStatus: (clientId: string, payload: UpdateStatusPayload) =>
    api
      .patch<ApiSuccess>(endpoints.admin.clientStatus(clientId), payload)
      .then((res) => res.data),
  clientPayments: (
    clientId: string,
    params?: AdminClientPaymentsParams,
    config?: RequestConfig,
  ) =>
    api
      .get<PageResponse<AdminPaymentListItem>>(endpoints.admin.clientPayments(clientId), {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  markClientPaymentComplete: (clientId: string, payload: MarkPaymentCompletePayload) =>
    api
      .post<PaymentResponse>(endpoints.admin.markClientPaymentComplete(clientId), payload)
      .then((res) => res.data),
  agents: (params?: AdminAgentsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<AdminAgentListItem>>(endpoints.admin.agents, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  agent: (agentId: string, config?: RequestConfig) =>
    api
      .get<AdminAgentDetail>(endpoints.admin.agent(agentId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  assignAgentAvenues: (agentId: string, payload: AssignAgentAvenuesPayload) =>
    api
      .put<ApiSuccess>(endpoints.admin.agentAvenues(agentId), payload)
      .then((res) => res.data),
  updateAgent: (agentId: string, payload: UpdateAgentPayload) =>
    api
      .patch<AdminAgentDetail>(endpoints.admin.agent(agentId), payload)
      .then((res) => res.data),
  updateAgentStatus: (agentId: string, payload: UpdateStatusPayload) =>
    api
      .patch<ApiSuccess>(endpoints.admin.agentStatus(agentId), payload)
      .then((res) => res.data),
  legacyDeactivateAgent: (userId: string) =>
    api
      .post<ApiSuccess>(endpoints.admin.legacyDeactivateAgent, { userId })
      .then((res) => res.data),
  payments: (params?: AdminPaymentsParams, config?: RequestConfig) =>
    api
      .get<PageResponse<AdminPaymentListItem>>(endpoints.admin.payments, {
        params,
        signal: config?.signal,
      })
      .then((res) => res.data),
  payment: (paymentId: string, config?: RequestConfig) =>
    api
      .get<AdminPaymentDetail>(endpoints.admin.payment(paymentId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  paymentReceiptData: (paymentId: string, config?: RequestConfig) =>
    api
      .get<ReceiptData>(endpoints.payments.receiptData(paymentId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  runBillingDaily: () =>
    api.post<ApiSuccess>(endpoints.billing.runDaily).then((res) => res.data),
  downloadReceipt: (receiptId: string) =>
    downloadFile(endpoints.payments.receiptDownload(receiptId)),
  verifyReceipt: (receiptId: string, config?: RequestConfig) =>
    api
      .get<ReceiptVerification>(endpoints.publicReceipts.verify(receiptId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  generateAvenueMonthlyReport: (payload: GenerateAvenueMonthlyReportPayload) =>
    api
      .post<AvenueMonthlyReportJob>(endpoints.admin.reportAvenueMonthly, payload)
      .then((res) => res.data),
  avenueMonthlyReportStatus: (reportId: string, config?: RequestConfig) =>
    api
      .get<AvenueMonthlyReportStatus>(endpoints.admin.reportAvenueMonthlyStatus(reportId), {
        signal: config?.signal,
      })
      .then((res) => res.data),
  downloadAvenueMonthlyReport: (
    reportId: string,
    disposition: "inline" | "attachment" = "inline",
  ) =>
    api
      .get<Blob>(endpoints.admin.reportAvenueMonthlyDownload(reportId), {
        params: { disposition },
        responseType: "blob",
      })
      .then((res) => res.data),
  downloadAgentTemplateCsv: () => downloadFile(endpoints.admin.importAgentTemplateCsv),
  downloadAgentTemplateXlsx: () => downloadFile(endpoints.admin.importAgentTemplateXlsx),
  downloadClientTemplateCsv: () => downloadFile(endpoints.admin.importClientTemplateCsv),
  downloadClientTemplateXlsx: () => downloadFile(endpoints.admin.importClientTemplateXlsx),
  importAgents: (file: File) => uploadFile(endpoints.admin.importAgents, file),
  importClients: (file: File) => uploadFile(endpoints.admin.importClients, file),
};
