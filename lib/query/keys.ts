import type {
  AdminAgentsParams,
  AdminClientPaymentsParams,
  AdminClientsParams,
  AdminLocationsParams,
  AdminPaymentsParams,
  AdminServiceTypesParams,
  CommissionSummaryParams,
} from "@/lib/api/types";
import type { DashboardParams } from "@/lib/api/admin";

export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    dashboard: (params?: DashboardParams) =>
      [...queryKeys.admin.all, "dashboard", params ?? {}] as const,
    serviceTypes: {
      all: () => [...queryKeys.admin.all, "service-types"] as const,
      list: (params?: AdminServiceTypesParams) =>
        [...queryKeys.admin.serviceTypes.all(), "list", params ?? {}] as const,
    },
    locations: {
      all: () => [...queryKeys.admin.all, "locations"] as const,
      quartiers: (params?: AdminLocationsParams) =>
        [...queryKeys.admin.locations.all(), "quartiers", params ?? {}] as const,
      serines: (params?: AdminLocationsParams) =>
        [...queryKeys.admin.locations.all(), "serines", params ?? {}] as const,
      avenues: (params?: AdminLocationsParams) =>
        [...queryKeys.admin.locations.all(), "avenues", params ?? {}] as const,
    },
    commissions: {
      all: () => [...queryKeys.admin.all, "commissions"] as const,
      config: () => [...queryKeys.admin.commissions.all(), "config"] as const,
      summary: (params?: CommissionSummaryParams) =>
        [...queryKeys.admin.commissions.all(), "summary", params ?? {}] as const,
      details: (params?: CommissionSummaryParams) =>
        [...queryKeys.admin.commissions.all(), "details", params ?? {}] as const,
    },
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
    reports: {
      all: () => [...queryKeys.admin.all, "reports"] as const,
      avenueMonthlyStatus: (reportId: string) =>
        [...queryKeys.admin.reports.all(), "avenue-monthly", "status", reportId] as const,
    },
  },
};
