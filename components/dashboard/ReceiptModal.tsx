"use client";

import Image from "next/image";
import {
  Modal,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { useTranslation } from "react-i18next";

import leafLogo from "@/assets/svgs/leaf_logo.svg";
import type { Payment } from "@/types";

interface Props {
  opened: boolean;
  onClose: () => void;
  payment: Payment | null;
}

function parseMoney(value: string) {
  return Number(value.replace(/[^0-9.]/g, ""));
}

function formatReceiptTotal(payment: Payment) {
  const amount = parseMoney(payment.amount);

  return `$ ${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export default function ReceiptModal({ opened, onClose, payment }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      classNames={{
        body: "px-0 pb-0",
        close: "text-foreground hover:bg-surface-muted",
        content: "rounded-md",
        header: "hidden",
      }}
      onClose={onClose}
      opened={opened}
      overlayProps={{ backgroundOpacity: 0.35, blur: 1 }}
      padding={0}
      size="min(760px, calc(100vw - 32px))"
      trapFocus
      withCloseButton={false}
    >
      {payment ? (
        <div className="bg-surface px-8 py-8 text-foreground md:px-12 md:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md border border-brand/20 bg-brand">
                <Image alt="" className="size-6" src={leafLogo} />
              </div>
              <p className="text-[22px] font-semibold">Societe Vision Net</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[42px] font-semibold leading-none text-foreground">
                {t("modals.receipt")}
              </p>
              <div className="mt-7 text-[12px] leading-5 text-text-muted">
                <p>{t("modals.receiptNo")}: {payment.receiptNumber}</p>
                <p>{payment.date}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[17px] font-semibold uppercase text-foreground">
              {t("modals.billedTo")}
            </p>
            <div className="mt-2 text-[12px] leading-6 text-text-muted">
              <p className="text-foreground">{payment.clientName}</p>
              <p>{payment.clientId.replaceAll("-", " ")}</p>
              <p>{t("modals.clientPaymentRecord")}</p>
            </div>
          </div>

          <div className="mt-10 overflow-hidden">
            <Table className="min-w-full">
              <TableThead>
                <TableTr className="border-b border-border">
                  {[
                    t("common.month"),
                    t("common.amount"),
                    t("common.agent"),
                    t("common.date"),
                  ].map((header) => (
                    <TableTh
                      className="px-1 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
                      key={header}
                    >
                      {header}
                    </TableTh>
                  ))}
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr className="border-b border-border">
                  <TableTd className="px-1 py-4 text-[12px] uppercase text-text-muted">
                    {payment.billingMonth}
                  </TableTd>
                  <TableTd className="px-1 py-4 text-[14px] font-semibold text-foreground">
                    {payment.amount}
                  </TableTd>
                  <TableTd className="px-1 py-4 text-[12px] text-text-muted">
                    {payment.agentName}
                  </TableTd>
                  <TableTd className="px-1 py-4 text-[12px] text-text-muted">
                    {payment.date}
                  </TableTd>
                </TableTr>
              </TableTbody>
            </Table>
          </div>

          <div className="mt-5 grid gap-8 sm:grid-cols-[1fr_180px] sm:items-start">
            <div>
              <div className="grid grid-cols-[120px_1fr] items-baseline gap-4">
                <p className="text-[22px] font-semibold">{t("modals.total")}</p>
                <p className="text-[22px] font-semibold">{formatReceiptTotal(payment)}</p>
              </div>
              <div className="mt-12">
                <p className="text-[9px] text-text-muted">{t("modals.verificationQrCode")}</p>
                <div className="mt-2 grid size-20 grid-cols-5 gap-1 bg-brand-dark p-1">
                  {Array.from({ length: 25 }, (_, index) => (
                    <span
                      className={
                        index % 2 === 0 || [3, 7, 11, 17, 23].includes(index)
                          ? "bg-surface"
                          : "bg-brand-dark"
                      }
                      key={index}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              className="h-11 rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand/90"
              onClick={onClose}
              type="button"
            >
              {t("modals.done")}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
