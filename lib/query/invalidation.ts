import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

export function invalidateDashboard(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
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
