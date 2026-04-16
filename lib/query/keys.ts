import type {
  AdminAgentsParams,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminPaymentsParams,
} from "@/lib/api/types";
import type { DashboardParams } from "@/lib/api/admin";

export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    dashboard: (params?: DashboardParams) =>
      [...queryKeys.admin.all, "dashboard", params ?? {}] as const,
    clients: {
      all: () => [...queryKeys.admin.all, "clients"] as const,
      list: (params?: AdminClientsParams) =>
        [...queryKeys.admin.clients.all(), "list", params ?? {}] as const,
      detail: (clientId: string) =>
        [...queryKeys.admin.clients.all(), "detail", clientId] as const,
      payments: (clientId: string, params?: AdminClientPaymentsParams) =>
        [...queryKeys.admin.clients.detail(clientId), "payments", params ?? {}] as const,
    },
    agents: {
      all: () => [...queryKeys.admin.all, "agents"] as const,
      list: (params?: AdminAgentsParams) =>
        [...queryKeys.admin.agents.all(), "list", params ?? {}] as const,
      detail: (agentId: string) =>
        [...queryKeys.admin.agents.all(), "detail", agentId] as const,
    },
    payments: {
      all: () => [...queryKeys.admin.all, "payments"] as const,
      list: (params?: AdminPaymentsParams) =>
        [...queryKeys.admin.payments.all(), "list", params ?? {}] as const,
      detail: (paymentId: string) =>
        [...queryKeys.admin.payments.all(), "detail", paymentId] as const,
      receiptData: (paymentId: string) =>
        [...queryKeys.admin.payments.all(), "receipt-data", paymentId] as const,
    },
    receipt: {
      verification: (receiptId: string) =>
        [...queryKeys.admin.all, "receipt", "verification", receiptId] as const,
    },
  },
};
