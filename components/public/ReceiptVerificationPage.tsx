"use client";

import {
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import AppLogo from "@/components/dashboard/AppLogo";
import { getApiErrorMessage } from "@/lib/api/client";
import { useReceiptVerificationQuery } from "@/lib/query/hooks";

interface Props {
  receiptId: string;
}

const receiptIdPattern = /^[A-Za-z0-9-]{8,}$/;

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
  const errorMessage = verificationQuery.error
    ? getApiErrorMessage(verificationQuery.error)
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
        <section className="flex flex-col items-center justify-center w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-panel pt-4">
          <AppLogo hideAdmin />
          <div className="relative p-6 sm:p-8 lg:p-10">
            {verificationQuery.isLoading && isReceiptIdValid ? (
              <LoadingState />
            ) : null}

            {!verificationQuery.isLoading || !isReceiptIdValid ? (
              <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-panel sm:p-8">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-2 lg:px-4 py-2 text-[10px] lg:text-sm font-semibold ${
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

                <h2 className="mt-5 text-md lg:text-3xl font-semibold leading-tight text-foreground">
                  {!isReceiptIdValid
                    ? "This receipt link is not valid."
                    : isValid
                      ? "This receipt is valid and was issued by Société Vision Net."
                      : "We could not confirm this receipt."}
                </h2>

                <p className="mt-4 text-xs lg:text-sm lg:leading-7 text-text-muted sm:text-base">
                  {summaryMessage}
                </p>

                <div className="mt-8 rounded-2xl border border-border/80 bg-surface-muted/70 px-4 py-4 text-xs lg:text-sm lg:leading-6 text-text-muted">
                  Reference:{" "}
                  <span className="font-semibold text-foreground">
                    {normalizedReceiptId}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
