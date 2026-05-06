import type { AdminPaymentListItem } from "@/lib/api/types";

export function getAdminPaymentId(
  payment: Pick<AdminPaymentListItem, "id" | "paymentId">,
) {
  return payment.paymentId || payment.id || "";
}

export function getPaymentActorName(
  payment: Pick<AdminPaymentListItem, "adminName" | "agentName" | "setByAdmin">,
) {
  if (payment.setByAdmin) {
    return payment.adminName ?? "Admin";
  }

  return payment.agentName ?? "-";
}
