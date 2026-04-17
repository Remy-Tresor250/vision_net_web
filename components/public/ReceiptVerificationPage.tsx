"use client";

import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineCheckBadge,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import AppLogo from "@/components/dashboard/AppLogo";
import { adminApi } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, formatMonths } from "@/lib/format";
import { useReceiptVerificationQuery } from "@/lib/query/hooks";

interface Props {
  receiptId: string;
}

const receiptIdPattern = /^[A-Za-z0-9-]{8,}$/;

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface-muted/80 p-4 shadow-card">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-semibold text-foreground sm:text-base">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-panel sm:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-surface-muted" />
        <div className="h-10 w-3/4 rounded-2xl bg-surface-muted" />
        <div className="h-24 rounded-[1.5rem] bg-surface-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
          <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

export default function ReceiptVerificationPage({ receiptId }: Props) {
  const normalizedReceiptId = receiptId.trim();
  const isReceiptIdValid = receiptIdPattern.test(normalizedReceiptId);
  const verificationQuery = useReceiptVerificationQuery(
    isReceiptIdValid ? normalizedReceiptId : "",
  );
  const verification = verificationQuery.data;
  const isValid = Boolean(verification?.valid);
  const detailsQuery = useQuery({
    enabled: isValid && Boolean(verification?.paymentId),
    queryKey: ["public-receipt-details", verification?.paymentId],
    queryFn: ({ signal }) =>
      adminApi.paymentReceiptData(verification?.paymentId ?? "", { signal }),
    retry: 0,
  });
  const details = detailsQuery.data;
  const errorMessage = verificationQuery.error
    ? getApiErrorMessage(verificationQuery.error)
    : null;
  const detailsErrorMessage = detailsQuery.error
    ? getApiErrorMessage(detailsQuery.error)
    : null;
  const summaryMessage = !isReceiptIdValid
    ? "The receipt link looks incomplete or malformed."
    : errorMessage
      ? errorMessage
      : isValid
        ? "This receipt was verified successfully against the public verification service."
        : "The receipt ID may be incorrect, expired, or not recognized by the verification service.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-64 w-64 rounded-full bg-brand/14 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 right-[-8%] h-72 w-72 rounded-full bg-[#dff4e6] blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(18,161,94,0.12),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-panel lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative border-b border-border bg-surface-muted/80 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            <AppLogo />

            <div className="mt-10 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand backdrop-blur">
                <HiOutlineShieldCheck className="size-4" />
                 Receipt validation
              </div>

              <h1 className="mt-5 text-xl font-semibold leading-tight text-foreground sm:text-5xl">
                Verify Vision Net QR code authenticity instantly.
              </h1>

              <p className="mt-5 max-w-lg text-xs text-text-muted sm:text-base">
                This secure page confirms whether a scanned receipt belongs to a
                valid Vision Net payment record.
              </p>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-card">
                  <HiOutlineCheckBadge className="size-6" />
                </div>
                <div>
                  <p className="sm:text-lg text-md font-semibold text-foreground">
                    Trusted verification flow
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Each QR code lands on a unique public route and validates the
                    receipt directly against the backend verification endpoint.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            {verificationQuery.isLoading && isReceiptIdValid ? <LoadingState /> : null}

            {!verificationQuery.isLoading || !isReceiptIdValid ? (
              <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-panel sm:p-8">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    !isReceiptIdValid
                      ? "bg-danger-soft text-danger"
                      : isValid
                      ? "bg-brand-soft text-brand"
                      : "bg-danger-soft text-danger"
                  }`}
                >
                  {isValid && isReceiptIdValid ? (
                    <HiOutlineCheckBadge className="size-5" />
                  ) : (
                    <HiOutlineExclamationTriangle className="size-5" />
                  )}
                  {isValid && isReceiptIdValid
                    ? "Authentic receipt"
                    : "Verification failed"}
                </div>

                <h2 className="mt-5 text-3xl font-semibold leading-tight text-foreground">
                  {!isReceiptIdValid
                    ? "This receipt link is not valid."
                    : isValid
                    ? "This receipt is valid and was issued by Vision Net."
                    : "We could not confirm this receipt."}
                </h2>

                <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
                  {summaryMessage}
                </p>

                {isValid ? (
                  <>
                    {detailsQuery.isLoading ? (
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
                        <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
                        <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
                        <div className="h-32 rounded-[1.5rem] bg-surface-muted" />
                      </div>
                    ) : null}

                    {!detailsQuery.isLoading ? (
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <InfoTile
                          icon={HiOutlineDocumentText}
                          label="Receipt Number"
                          value={details?.receiptNumber ?? verification?.receiptNumber ?? "Unavailable"}
                        />
                        <InfoTile
                          icon={HiOutlineCurrencyDollar}
                          label="Amount Paid"
                          value={details?.amount ? formatCurrency(details.amount) : "Unavailable"}
                        />
                        <InfoTile
                          icon={HiOutlineUsers}
                          label="Client"
                          value={details?.clientName ?? "Unavailable"}
                        />
                        <InfoTile
                          icon={HiOutlineUser}
                          label="Collected By"
                          value={details?.agentName ?? "Unavailable"}
                        />
                        <InfoTile
                          icon={HiOutlineCalendarDays}
                          label="Payment Date"
                          value={details?.paymentDate ? formatDate(details.paymentDate) : "Unavailable"}
                        />
                        <InfoTile
                          icon={HiOutlineShieldCheck}
                          label="Billing Month(s)"
                          value={details?.months?.length ? formatMonths(details.months) : "Unavailable"}
                        />
                      </div>
                    ) : null}

                    {detailsErrorMessage ? (
                      <div className="mt-6 rounded-2xl border border-warning/30 bg-[#fff8ec] px-4 py-3 text-sm leading-6 text-foreground">
                        Payment details are temporarily unavailable, but the receipt itself is verified as authentic.
                      </div>
                    ) : null}
                  </>
                ) : null}

                <div className="mt-8 rounded-2xl border border-border/80 bg-surface-muted/70 px-4 py-4 text-sm leading-6 text-text-muted">
                  Reference: <span className="font-semibold text-foreground">{normalizedReceiptId}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
