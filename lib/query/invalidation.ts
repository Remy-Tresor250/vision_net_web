import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

export function invalidateDashboard(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
}

export function invalidateServiceTypes(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.serviceTypes.all(),
  });
}

export function invalidateLocations(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.locations.all(),
  });
}

export function invalidateCommissions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.commissions.all(),
  });
}

export function invalidateReports(queryClient: QueryClient, reportId?: string) {
  queryClient.invalidateQueries({
    queryKey: queryKeys.admin.reports.all(),
  });

  if (reportId) {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.admin.reports.avenueMonthlyStatus(reportId),
    });
  }

  return Promise.resolve();
}

export function invalidateClients(queryClient: QueryClient, clientId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all() });

  if (clientId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.clients.detail(clientId),
    });
  }

  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.dashboard(),
  });
}

export function invalidateAgents(queryClient: QueryClient, agentId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents.all() });

  if (agentId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.agents.detail(agentId),
    });
  }

  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.dashboard(),
  });
}

export function invalidatePayments(queryClient: QueryClient, clientId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.all() });

  if (clientId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.clients.detail(clientId),
    });
  }

  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.dashboard(),
  });
}
