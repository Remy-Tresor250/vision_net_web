import type { AdminPaymentListItem } from "@/lib/api/types";

export function getAdminPaymentId(
  payment: Pick<AdminPaymentListItem, "id" | "paymentId">,
) {
  return payment.paymentId || payment.id || "";
}
