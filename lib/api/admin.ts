"use client";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AdminAgentDetail,
  AdminAgentListItem,
  AdminAgentsParams,
  AdminClientDetail,
  AdminClientListItem,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPaymentsParams,
  ApiSuccess,
  CreateAdminUserPayload,
  CreateAgentPayload,
  CreateClientPayload,
  DashboardResponse,
  ImportReport,
  MarkPaymentCompletePayload,
  PageResponse,
  PaymentResponse,
  ReceiptData,
  ReceiptVerification,
  UpdateStatusPayload,
  UpdateAgentPayload,
  UpdateClientPayload,
  UserSummary,
} from "@/lib/api/types";

export interface DashboardParams {
  year?: number;
  topAgentsLimit?: number;
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
  dashboard: (params?: DashboardParams) =>
    api.get<DashboardResponse>(endpoints.admin.dashboard, { params }).then((res) => res.data),
  createAdmin: (payload: CreateAdminUserPayload) =>
    api.post<UserSummary>(endpoints.admin.admins, payload).then((res) => res.data),
  createAgent: (payload: CreateAgentPayload) =>
    api.post<UserSummary>(endpoints.admin.createAgent, payload).then((res) => res.data),
  createClient: (payload: CreateClientPayload) =>
    api.post<UserSummary>(endpoints.admin.createClient, payload).then((res) => res.data),
  clients: (params?: AdminClientsParams) =>
    api
      .get<PageResponse<AdminClientListItem>>(endpoints.admin.clients, { params })
      .then((res) => res.data),
  client: (clientId: string) =>
    api.get<AdminClientDetail>(endpoints.admin.client(clientId)).then((res) => res.data),
  updateClient: (clientId: string, payload: UpdateClientPayload) =>
    api
      .patch<AdminClientDetail>(endpoints.admin.client(clientId), payload)
      .then((res) => res.data),
  updateClientStatus: (clientId: string, payload: UpdateStatusPayload) =>
    api
      .patch<ApiSuccess>(endpoints.admin.clientStatus(clientId), payload)
      .then((res) => res.data),
  clientPayments: (clientId: string, params?: AdminClientPaymentsParams) =>
    api
      .get<PageResponse<AdminPaymentListItem>>(endpoints.admin.clientPayments(clientId), {
        params,
      })
      .then((res) => res.data),
  markClientPaymentComplete: (clientId: string, payload: MarkPaymentCompletePayload) =>
    api
      .post<PaymentResponse>(endpoints.admin.markClientPaymentComplete(clientId), payload)
      .then((res) => res.data),
  agents: (params?: AdminAgentsParams) =>
    api
      .get<PageResponse<AdminAgentListItem>>(endpoints.admin.agents, { params })
      .then((res) => res.data),
  agent: (agentId: string) =>
    api.get<AdminAgentDetail>(endpoints.admin.agent(agentId)).then((res) => res.data),
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
  payments: (params?: AdminPaymentsParams) =>
    api
      .get<PageResponse<AdminPaymentListItem>>(endpoints.admin.payments, { params })
      .then((res) => res.data),
  payment: (paymentId: string) =>
    api.get<AdminPaymentDetail>(endpoints.admin.payment(paymentId)).then((res) => res.data),
  paymentReceiptData: (paymentId: string) =>
    api.get<ReceiptData>(endpoints.payments.receiptData(paymentId)).then((res) => res.data),
  runBillingDaily: () =>
    api.post<ApiSuccess>(endpoints.billing.runDaily).then((res) => res.data),
  downloadReceipt: (receiptId: string) =>
    downloadFile(endpoints.payments.receiptDownload(receiptId)),
  verifyReceipt: (receiptId: string) =>
    api
      .get<ReceiptVerification>(endpoints.publicReceipts.verify(receiptId))
      .then((res) => res.data),
  downloadAgentTemplateCsv: () => downloadFile(endpoints.admin.importAgentTemplateCsv),
  downloadAgentTemplateXlsx: () => downloadFile(endpoints.admin.importAgentTemplateXlsx),
  downloadClientTemplateCsv: () => downloadFile(endpoints.admin.importClientTemplateCsv),
  downloadClientTemplateXlsx: () => downloadFile(endpoints.admin.importClientTemplateXlsx),
  importAgents: (file: File) => uploadFile(endpoints.admin.importAgents, file),
  importClients: (file: File) => uploadFile(endpoints.admin.importClients, file),
};
