import type { ClientType } from "@/lib/api/types";

export const CLIENT_TYPES = ["NORMAL", "POTENTIAL"] as const satisfies readonly ClientType[];

export function normalizeClientType(value: string | null | undefined): ClientType {
  return value === "POTENTIAL" ? "POTENTIAL" : "NORMAL";
}

export function getClientTypeLabelKey(clientType: ClientType) {
  return clientType === "POTENTIAL" ? "common.potential" : "common.normal";
}
