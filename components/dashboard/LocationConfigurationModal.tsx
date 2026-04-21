"use client";

import { Modal, Skeleton, TextInput } from "@mantine/core";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";

export type LocationModalMode = "new-location" | "add-cell" | "add-avenue" | "edit";

export interface AvenueDraft {
  avenueId?: string;
  id: string;
  name: string;
}

export interface CellDraft {
  avenues: AvenueDraft[];
  id: string;
  locked: boolean;
  name: string;
  serineId?: string;
}

interface Props {
  cells: CellDraft[];
  isSaving: boolean;
  mode: LocationModalMode;
  onAddAvenue: (cellId: string) => void;
  onAddCell: () => void;
  onClose: () => void;
  onRemoveAvenue: (cellId: string, avenueId: string) => void;
  onRemoveCell: (cellId: string) => void;
  onSave: () => void;
  onUpdateAvenue: (cellId: string, avenueId: string, value: string) => void;
  onUpdateCell: (cellId: string, value: string) => void;
  opened: boolean;
  quartierLocked: boolean;
  quartierName: string;
  submitLabel: string;
  setQuartierName: (value: string) => void;
  title: string;
}

export function createAvenueDraft(name = "", avenueId?: string): AvenueDraft {
  return {
    avenueId,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
  };
}

export function createCellDraft(options?: Partial<CellDraft>): CellDraft {
  return {
    avenues: options?.avenues?.length ? options.avenues : [createAvenueDraft()],
    id: options?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    locked: options?.locked ?? false,
    name: options?.name ?? "",
    serineId: options?.serineId,
  };
}

export default function LocationConfigurationModal({
  cells,
  isSaving,
  mode,
  onAddAvenue,
  onAddCell,
  onClose,
  onRemoveAvenue,
  onRemoveCell,
  onSave,
  onUpdateAvenue,
  onUpdateCell,
  opened,
  quartierLocked,
  quartierName,
  submitLabel,
  setQuartierName,
  title,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      classNames={{
        body: "px-8 pb-8",
        content: "rounded-sm",
        header: "px-8 pt-8",
        title: "w-full text-center",
      }}
      closeButtonProps={{
        icon: <HiOutlineXMark className="size-6" />,
      }}
      onClose={onClose}
      opened={opened}
      radius="sm"
      size="xl"
      title={<span className="text-[28px] font-semibold text-foreground">{title}</span>}
    >
      <div className="space-y-5 lg:px-6">
        <TextInput
          classNames={appFieldClassNames}
          disabled={quartierLocked || isSaving}
          label={t("configurations.quartier")}
          onChange={(event) => setQuartierName(event.currentTarget.value)}
          placeholder={t("configurations.quartierName")}
          styles={appFieldStyles}
          value={quartierName}
        />

        <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
          {cells.map((cell, cellIndex) => (
            <section
              className="rounded-sm border border-border bg-surface-muted/70 p-5"
              key={cell.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold text-foreground">
                  {t("configurations.cell")} {cellIndex + 1}
                </p>
                {mode !== "add-avenue" && mode !== "edit" && cells.length > 1 && !cell.locked ? (
                  <button
                    className="text-[13px] font-medium text-danger"
                    disabled={isSaving}
                    onClick={() => onRemoveCell(cell.id)}
                    type="button"
                  >
                    {t("configurations.removeCell")}
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={cell.locked || isSaving}
                  label={t("configurations.cell")}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    onUpdateCell(cell.id, value);
                  }}
                  placeholder={t("configurations.cellName")}
                  styles={appFieldStyles}
                  value={cell.name}
                />
              </div>

              <div className="mt-5 space-y-4">
                {cell.avenues.map((avenue, avenueIndex) => (
                  <div className="flex items-end gap-3" key={avenue.id}>
                    <div className="flex-1">
                      <TextInput
                        classNames={appFieldClassNames}
                        disabled={isSaving}
                        label={
                          avenueIndex === 0
                            ? t("configurations.avenueName")
                            : t("configurations.additionalAvenue")
                        }
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          onUpdateAvenue(cell.id, avenue.id, value);
                        }}
                        placeholder={t("configurations.avenueName")}
                        styles={appFieldStyles}
                        value={avenue.name}
                      />
                    </div>
                    {cell.avenues.length > 1 ? (
                      <button
                        aria-label={t("configurations.removeAvenue")}
                        className="mb-[6px] flex size-11 items-center justify-center rounded-sm border border-border bg-surface text-text-muted hover:text-foreground"
                        disabled={isSaving}
                        onClick={() => onRemoveAvenue(cell.id, avenue.id)}
                        type="button"
                      >
                        <HiOutlineXMark className="size-5" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-start">
                <button
                  className="text-[14px] font-medium text-brand"
                  disabled={isSaving}
                  onClick={() => onAddAvenue(cell.id)}
                  type="button"
                >
                  + {t("configurations.addAnotherAvenue")}
                </button>
              </div>
            </section>
          ))}
        </div>

        {mode !== "add-avenue" && mode !== "edit" ? (
          <div className="flex justify-start">
            <button
              className="text-[14px] font-medium text-brand"
              disabled={isSaving}
              onClick={onAddCell}
              type="button"
            >
              + {t("configurations.addAnotherCell")}
            </button>
          </div>
        ) : null}

        {isSaving ? (
          <div className="space-y-2">
            <Skeleton className="h-3 rounded-sm" />
            <Skeleton className="h-3 w-2/3 rounded-sm" />
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            className="flex flex-row items-center gap-[4px] rounded-[6px] border border-gray-500 bg-transparent px-[12px] py-[6px]"
            onClick={onClose}
            type="button"
          >
            <p className="text-[14px] text-black">{t("actions.cancel")}</p>
          </button>
          <button
            className="flex flex-row items-center gap-[4px] rounded-[6px] bg-brand px-[12px] py-[6px]"
            disabled={isSaving}
            onClick={onSave}
            type="button"
          >
            <p className="text-[14px] text-white">{isSaving ? t("forms.saving") : submitLabel}</p>
          </button>
        </div>
      </div>
    </Modal>
  );
}
