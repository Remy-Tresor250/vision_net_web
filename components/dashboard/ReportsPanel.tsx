"use client";

import { Modal, Select } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineDocumentChartBar } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import NoDataCard from "@/components/dashboard/NoDataCard";
import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { adminApi } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAdminAvenuesQuery,
  useAvenueMonthlyReportStatusQuery,
  useGenerateAvenueMonthlyReportMutation,
} from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

type BillingMonthValue = Date | string | { toDate: () => Date } | null;

function toBillingMonthDate(value: BillingMonthValue) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value === "object" && "toDate" in value) {
    const parsedDate = value.toDate();

    return parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime())
      ? parsedDate
      : null;
  }

  return null;
}

function formatMonthPayload(value: BillingMonthValue) {
  const date = toBillingMonthDate(value) ?? new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function buildPdfPreviewUrl(pdfUrl: string) {
  return `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

export default function ReportsPanel() {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canViewLocations = hasAnyPermission(permissions, ["locations.view"]);
  const canViewReports = hasAnyPermission(permissions, ["reports.view"]);
  const canCreateReports = hasAnyPermission(permissions, ["reports.create"]);
  const currentMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, []);
  const [billingMonth, setBillingMonth] = useState<BillingMonthValue>(null);
  const [avenueSearch, setAvenueSearch] = useState("");
  const [selectedAvenueId, setSelectedAvenueId] = useState("");
  const [selectedAvenueLabel, setSelectedAvenueLabel] = useState("");
  const [reportId, setReportId] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [debouncedAvenueSearch] = useDebouncedValue(avenueSearch, 350);
  const [previewOpened, setPreviewOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 47.99em)");

  const avenuesQuery = useAdminAvenuesQuery(
    {
      limit: 100,
      search: debouncedAvenueSearch || undefined,
      skip: 0,
    },
    { enabled: canViewLocations },
  );
  const generateReportMutation = useGenerateAvenueMonthlyReportMutation();
  const reportStatusQuery = useAvenueMonthlyReportStatusQuery(reportId, {
    enabled: Boolean(reportId) && canViewReports,
  });

  const avenueOptions = useMemo(() => {
    const options = (avenuesQuery.data?.data ?? []).map((avenue) => ({
      label: avenue.name,
      value: avenue.id,
    }));

    if (
      selectedAvenueId &&
      selectedAvenueLabel &&
      !options.some((option) => option.value === selectedAvenueId)
    ) {
      return [{ label: selectedAvenueLabel, value: selectedAvenueId }, ...options];
    }

    return options;
  }, [avenuesQuery.data?.data, selectedAvenueId, selectedAvenueLabel]);

  const currentSearchResults = useMemo(
    () =>
      (avenuesQuery.data?.data ?? []).map((avenue) => ({
        label: avenue.name,
        value: avenue.id,
      })),
    [avenuesQuery.data?.data],
  );

  const previewTitle =
    reportStatusQuery.data?.avenueName ??
    selectedAvenueLabel ??
    t("reports.selectAvenue");
  const previewSrc = pdfUrl ? buildPdfPreviewUrl(pdfUrl) : null;
  const isGenerating =
    generateReportMutation.isPending ||
    loadingPdf ||
    reportStatusQuery.data?.status === "PROCESSING" ||
    reportStatusQuery.data?.status === "QUEUED";
  const progressPercent = reportStatusQuery.data?.progressPercent ?? 0;
  const resolvedBillingMonth = toBillingMonthDate(billingMonth);
  const canGenerateReport =
    canCreateReports && canViewLocations && Boolean(selectedAvenueId && resolvedBillingMonth);
  const showPreviewModal = Boolean(previewOpened || isGenerating || pdfUrl);

  useEffect(() => {
    if (!selectedAvenueId) {
      return;
    }

    const selectedOption = currentSearchResults.find(
      (option) => option.value === selectedAvenueId,
    );

    if (selectedOption && selectedOption.label !== selectedAvenueLabel) {
      setSelectedAvenueLabel(selectedOption.label);
    }
  }, [currentSearchResults, selectedAvenueId, selectedAvenueLabel]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (
      !reportId ||
      !reportStatusQuery.data?.fileReady ||
      reportStatusQuery.data.status !== "COMPLETED"
    ) {
      return;
    }

    let cancelled = false;

    async function loadPdf() {
      setLoadingPdf(true);

      try {
        const blob = await adminApi.downloadAvenueMonthlyReport(
          reportId,
          "inline",
        );

        if (cancelled) {
          return;
        }

        const nextUrl = URL.createObjectURL(blob);

        setPdfUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }

          return nextUrl;
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingPdf(false);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [
    reportId,
    reportStatusQuery.data?.fileReady,
    reportStatusQuery.data?.status,
  ]);

  function handleGeneratePreview() {
    if (!selectedAvenueId) {
      toast.error(t("reports.selectAvenueFirst"));
      return;
    }

    if (!resolvedBillingMonth) {
      toast.error(t("reports.selectBillingMonth"));
      return;
    }

    setReportId("");
    setPreviewOpened(true);
    setPdfUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });

    generateReportMutation.mutate(
      {
        avenueId: selectedAvenueId,
        month: formatMonthPayload(resolvedBillingMonth),
      },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: (response) => {
          toast.success(t("reports.generationStarted"));
          setReportId(response.reportId);
        },
      },
    );
  }

  function handleDownloadPdf() {
    if (!pdfUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${previewTitle.toLowerCase().replace(/\s+/g, "-")}-report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handlePrintPdf() {
    if (!previewSrc) {
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.src = previewSrc;
    document.body.appendChild(printFrame);

    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();

        setTimeout(() => {
          printFrame.remove();
        }, 1000);
      }, 250);
    };
  }

  function closePreviewModal() {
    if (isGenerating) {
      return;
    }

    setPreviewOpened(false);
  }

  return (
    <div className="grid gap-6 px-2 py-3 xl:grid-cols-[0.9fr_1.1fr] xl:px-6">
      <section className="rounded-sm border border-border bg-surface p-6 shadow-card xl:p-8">
        <h2 className="text-[28px] font-medium text-foreground">
          {t("reports.reportGeneration")}
        </h2>

        <div className="mt-8 space-y-7">
          <MonthPickerInput
            classNames={appFieldClassNames}
            disabled={isGenerating}
            label={t("reports.selectBillingMonth")}
            maxDate={currentMonth}
            onChange={setBillingMonth}
            placeholder="ex. April 2026"
            styles={appFieldStyles}
            value={billingMonth}
            valueFormat="MMMM YYYY"
          />

          {canViewLocations ? (
            <Select
              classNames={appFieldClassNames}
              data={avenueOptions}
              disabled={isGenerating}
              label={t("reports.selectAvenue")}
              nothingFoundMessage={t("reports.noAvenuesFound")}
              onChange={(value, option) => {
                setSelectedAvenueId(value ?? "");
                setSelectedAvenueLabel(value ? option.label : "");
                setAvenueSearch("");
              }}
              onSearchChange={setAvenueSearch}
              placeholder={t("reports.selectAvenuePlaceholder")}
              searchable
              searchValue={avenueSearch}
              styles={appFieldStyles}
              value={selectedAvenueId}
            />
          ) : (
            <NoDataCard
              className="min-h-40"
              message={t("permissions.missingLocations")}
              title={t("reports.selectAvenue")}
            />
          )}

          <Button
            className="h-[54px] w-full rounded-sm font-medium"
            disabled={isGenerating || !canGenerateReport}
            onClick={handleGeneratePreview}
          >
            <p className="text-[13px] sm:text-[14px]">
              {generateReportMutation.isPending
                ? t("reports.generating")
                : isGenerating
                  ? t("reports.preparingPreview")
                  : t("reports.generatePreview")}
            </p>
          </Button>
        </div>
      </section>

      <section className="hidden h-[86vh] overflow-hidden rounded-sm border border-border bg-surface shadow-card xl:block">
        {!reportId && !pdfUrl ? (
          <div className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(18,161,94,0.16),_transparent_34%),linear-gradient(180deg,_rgba(251,253,251,1)_0%,_rgba(244,248,245,1)_100%)] p-8">
            <div className="pointer-events-none absolute inset-x-10 top-10 h-24 rounded-full bg-brand/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-12 right-10 h-28 w-28 rounded-full border border-brand/15" />

            <div className="relative flex max-w-[28rem] flex-col items-center text-center">
              <div className="flex size-18 items-center justify-center rounded-[22px] border border-brand/15 bg-white/90 text-brand shadow-card">
                <HiOutlineDocumentChartBar className="size-9" />
              </div>

              <h3 className="mt-7 text-[26px] font-medium tracking-[-0.02em] text-foreground">
                {t("reports.previewTitle")}
              </h3>
              <p className="mt-3 max-w-[24rem] text-[16px] leading-7 text-text-muted">
                {t("reports.previewWillAppearHere")}
              </p>

              <div className="mt-8 grid w-full max-w-[24rem] gap-3 rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur">
                <div className="h-3 rounded-full bg-surface-muted" />
                <div className="h-3 w-10/12 rounded-full bg-surface-muted" />
                <div className="mt-2 h-32 rounded-[18px] border border-dashed border-brand/20 bg-brand/5" />
              </div>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="flex-1 flex-col bg-[linear-gradient(180deg,_rgba(251,253,251,1)_0%,_rgba(245,249,246,1)_100%)] p-2 md:p-3">
            <div className="flex items-center justify-end gap-3">
              <button
                className="h-10 w-full rounded-sm px-5 text-[14px] font-medium border"
                onClick={handlePrintPdf}
              >
                <p className="text-[14px]">{t("reports.print")}</p>
              </button>
              <button
                className="h-10 w-full rounded-sm px-5 text-[14px] font-medium bg-brand"
                onClick={handleDownloadPdf}
              >
                <p className="text-[14px] text-white">{t("reports.download")}</p>
              </button>
            </div>

            <div className="mt-1 flex-1 shadow-card">
              <iframe
                className="h-[78vh] w-full bg-white"
                src={previewSrc ?? undefined}
                title={`${previewTitle} report preview`}
              />
            </div>
          </div>
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,_rgba(251,253,251,1)_0%,_rgba(245,249,246,1)_100%)] p-8">
            <div className="pointer-events-none absolute left-12 top-12 h-24 w-24 rounded-full bg-brand/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-12 right-12 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />

            <div className="relative w-full max-w-[30rem] rounded-[28px] border border-white/70 bg-white/92 p-7 shadow-card backdrop-blur md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-[20px] bg-brand text-white shadow-card">
                  <HiOutlineDocumentChartBar className="size-8" />
                </div>
                <p className="mt-5 text-[14px] uppercase tracking-[0.18em] text-text-muted">
                  {t("reports.generatingReport")}
                </p>
                <h3 className="mt-2 text-[24px] font-medium tracking-[-0.02em] text-foreground">
                  {previewTitle}
                </h3>
                <p className="mt-3 max-w-[24rem] text-[15px] leading-7 text-text-muted">
                  {loadingPdf
                    ? t("reports.finalizingDocument")
                    : t("reports.generatingDescription")}
                </p>
              </div>

              <div className="mt-8 rounded-[22px] bg-brand/[0.06] px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[14px] font-medium text-foreground">
                    {t("reports.progress")}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[14px] font-semibold text-brand shadow-sm">
                    {progressPercent}%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-2 text-[13px] font-medium text-brand">
                    <span className="size-2.5 animate-pulse rounded-full bg-brand" />
                    {reportStatusQuery.data?.status ??
                      t("reports.awaitingGeneration")}
                  </div>
                </div>
              </div>

              {reportStatusQuery.data?.errorMessage ? (
                <div className="mt-5 rounded-[18px] border border-danger/20 bg-danger/5 px-4 py-3 text-[14px] text-danger">
                  {reportStatusQuery.data.errorMessage}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <Modal
        centered
        classNames={{
          body: "px-3 pb-3 sm:px-5 sm:pb-5",
          content: "rounded-sm",
          header: "px-4 pt-4 sm:px-5 sm:pt-5",
          title: "w-full text-center text-[18px] font-semibold sm:text-[24px]",
        }}
        onClose={closePreviewModal}
        opened={showPreviewModal}
        radius="sm"
        size={isMobile ? "calc(100vw - 1rem)" : "80rem"}
        title={
          <span className="text-[20px] font-semibold text-foreground sm:text-[24px]">
            {isGenerating ? t("reports.reportGeneration") : `${previewTitle} report preview`}
          </span>
        }
      >
        <section className="h-[72vh] overflow-hidden rounded-sm border border-border bg-surface shadow-card">
          {!reportId && !pdfUrl ? (
            <div className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(18,161,94,0.16),_transparent_34%),linear-gradient(180deg,_rgba(251,253,251,1)_0%,_rgba(244,248,245,1)_100%)] p-6 sm:p-8">
              <div className="relative flex max-w-[28rem] flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-[22px] border border-brand/15 bg-white/90 text-brand shadow-card sm:size-18">
                  <HiOutlineDocumentChartBar className="size-8 sm:size-9" />
                </div>
                <p className="mt-6 text-[20px] font-semibold tracking-tight text-foreground sm:text-[28px]">
                  {t("reports.previewTitle")}
                </p>
                <p className="mt-3 max-w-md text-[13px] leading-6 text-text-muted sm:text-[14px]">
                  {t("reports.previewWillAppearHere")}
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand" />
              <div>
                <p className="text-[18px] font-semibold text-foreground sm:text-[22px]">
                  {t("reports.preparingPreview")}
                </p>
                <p className="mt-2 text-[13px] text-text-muted sm:text-[14px]">
                  {progressPercent}%
                </p>
              </div>
            </div>
          ) : previewSrc ? (
            <div className="flex h-full flex-col">
              <iframe className="h-full w-full" src={previewSrc} title={`${previewTitle} report preview`} />
              <div className="flex justify-end gap-3 border-t border-border p-3 sm:p-4">
                <Button onClick={handlePrintPdf} variant="outline">
                  <p className="text-[13px] sm:text-[14px]">{t("reports.print")}</p>
                </Button>
                <Button onClick={handleDownloadPdf}>
                  <p className="text-[13px] sm:text-[14px]">{t("reports.download")}</p>
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </Modal>
    </div>
  );
}
