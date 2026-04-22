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
    <div className="rounded-sm w-full border border-border bg-surface p-6 shadow-panel sm:p-8">
      <div className="animate-pulse space-y-4 w-full">
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
    ? "Le lien du reçu semble incomplet ou mal formé."
    : errorMessage
      ? errorMessage
      : isValid
        ? "Ce reçu a été vérifié avec succès par le service public de vérification."
        : "L'identifiant du reçu est peut-être incorrect, expiré ou non reconnu par le service de vérification.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-64 w-64 rounded-full bg-brand/14 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 right-[-8%] h-72 w-72 rounded-full bg-[#dff4e6] blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(18,161,94,0.12),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section className="flex flex-col items-center justify-center w-full overflow-hidden rounded-md border border-border bg-surface shadow-panel pt-4">
          <AppLogo hideAdmin />
          <div className="relative p-6 sm:p-8 lg:p-10">
            {verificationQuery.isLoading && isReceiptIdValid ? (
              <LoadingState />
            ) : null}

            {!verificationQuery.isLoading || !isReceiptIdValid ? (
              <div className="rounded-md border border-border bg-surface p-6 shadow-panel sm:p-8">
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
                    ? "Reçu authentique"
                    : "Échec de la vérification"}
                </div>

                <h2 className="mt-5 text-md lg:text-3xl font-semibold leading-tight text-foreground">
                  {!isReceiptIdValid
                    ? "Ce lien de reçu n'est pas valide."
                    : isValid
                      ? "Ce reçu est valide et a été émis par Société Vision Net."
                      : "Nous n'avons pas pu confirmer ce reçu."}
                </h2>

                <p className="mt-4 text-xs lg:text-sm lg:leading-7 text-text-muted sm:text-base">
                  {summaryMessage}
                </p>

                <div className="mt-8 rounded-2xl border border-border/80 bg-surface-muted/70 px-4 py-4 text-xs lg:text-sm lg:leading-6 text-text-muted">
                  Référence :{" "}
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
