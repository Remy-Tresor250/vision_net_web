"use client";

import { Modal, Popover, Select, TextInput } from "@mantine/core";
import { DatePickerInput, MonthPickerInput } from "@mantine/dates";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useState } from "react";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterField {
  id: string;
  label: string;
  type: "select" | "date" | "month" | "number";
  options?: FilterFieldOption[];
  placeholder?: string;
}

interface Props {
  addLabel?: string;
  className?: string;
  filterFields?: FilterField[];
  filters?: Record<string, string>;
  onAdd?: () => void;
  onFiltersChange?: (value: Record<string, string>) => void;
  onQueryChange: (value: string) => void;
  placeholder: string;
  query: string;
  title: ReactNode;
}

const EMPTY_FILTERS: Record<string, string> = {};

function toDateParts(value: string | Date | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

export default function FilterToolbar({
  addLabel,
  className,
  filterFields = [],
  filters = EMPTY_FILTERS,
  onAdd,
  onFiltersChange,
  onQueryChange,
  placeholder,
  query,
  title,
}: Props) {
  const { t, i18n } = useTranslation();
  const [searchValue, setSearchValue] = useState(query);
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<Record<string, string>>(filters);
  const [debouncedQuery] = useDebouncedValue(searchValue, 400);
  const emitQueryChange = useEffectEvent(onQueryChange);
  const isMobile = useMediaQuery("(max-width: 47.99em)");

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    setDraftFilters((currentDraftFilters) => {
      const nextFilters = JSON.stringify(filters);
      const currentFilters = JSON.stringify(currentDraftFilters);

      return nextFilters === currentFilters ? currentDraftFilters : filters;
    });
  }, [filters]);

  useEffect(() => {
    if (debouncedQuery === query) return;

    emitQueryChange(debouncedQuery);
  }, [debouncedQuery, query]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function updateDraftFilter(id: string, value: string | null) {
    setDraftFilters((current) => {
      const nextFilters = {
        ...current,
        [id]: value ?? "",
      };

      onFiltersChange?.(nextFilters);
      return nextFilters;
    });
  }

  function applyFilters() {
    setFiltersOpened(false);
  }

  function clearFilters() {
    const cleared = Object.fromEntries(
      Object.keys(draftFilters).map((key) => [key, ""]),
    );
    setDraftFilters(cleared);
    onFiltersChange?.(cleared);
    setFiltersOpened(false);
  }

  const filterContent = (
    <>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {filterFields.map((field) => {
          if (field.type === "select") {
            return (
              <Select
                classNames={appFieldClassNames}
                clearable
                data={field.options ?? []}
                key={field.id}
                label={field.label}
                onChange={(value) => updateDraftFilter(field.id, value)}
                placeholder={field.placeholder ?? field.label}
                styles={appFieldStyles}
                value={draftFilters[field.id] || null}
              />
            );
          }

          if (field.type === "date") {
            return (
              <DatePickerInput
                classNames={appFieldClassNames}
                clearable
                key={field.id}
                label={field.label}
                locale={i18n.language}
                onChange={(value) =>
                  updateDraftFilter(
                    field.id,
                    (() => {
                      const parts = toDateParts(value);

                      return parts
                        ? `${parts.year}-${parts.month}-${parts.day}`
                        : "";
                    })(),
                  )
                }
                placeholder={field.placeholder ?? field.label}
                styles={appFieldStyles}
                value={
                  draftFilters[field.id]
                    ? new Date(draftFilters[field.id])
                    : null
                }
                valueFormat="DD/MM/YYYY"
              />
            );
          }

          if (field.type === "month") {
            return (
              <MonthPickerInput
                classNames={appFieldClassNames}
                clearable
                key={field.id}
                label={field.label}
                locale={i18n.language}
                onChange={(value) =>
                  updateDraftFilter(
                    field.id,
                    (() => {
                      const parts = toDateParts(value);

                      return parts ? `${parts.year}-${parts.month}` : "";
                    })(),
                  )
                }
                placeholder={field.placeholder ?? field.label}
                styles={appFieldStyles}
                value={
                  draftFilters[field.id]
                    ? new Date(`${draftFilters[field.id]}-01`)
                    : null
                }
                valueFormat="MMMM YYYY"
              />
            );
          }

          return (
            <TextInput
              classNames={appFieldClassNames}
              key={field.id}
              label={field.label}
              onChange={(event) =>
                updateDraftFilter(field.id, event.currentTarget.value)
              }
              placeholder={field.placeholder ?? field.label}
              styles={appFieldStyles}
              type="number"
              value={draftFilters[field.id] ?? ""}
            />
          );
        })}
      </div>
      <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
        <button
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
          onClick={clearFilters}
          type="button"
        >
          <p className="text-[14px]">{t("filters.clear")}</p>
        </button>
        <button
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
          onClick={applyFilters}
          type="button"
        >
          <p className="text-[14px]">{t("filters.apply")}</p>
        </button>
      </div>
    </>
  );

  const filterTrigger = (
    <button
      className="flex h-12 items-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium text-foreground shadow-card hover:bg-surface-muted"
      onClick={() => setFiltersOpened((current) => !current)}
      type="button"
    >
      <HiOutlineAdjustmentsHorizontal className="size-5 text-text-muted" />
      <span>{t("actions.filter")}</span>
      {activeFilterCount ? (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  );

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {typeof title === "string" ? (
          <h2 className="text-[22px] font-medium text-[#0A3B24] sm:text-[24px] lg:text-[27px]">
            {title}
          </h2>
        ) : (
          title
        )}
      </div>
      <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center lg:justify-end">
        <div className="w-full sm:max-w-sm lg:w-[30vw] lg:max-w-none">
          <TextInput
            aria-label={placeholder}
            classNames={{
              input:
                "h-12 rounded-md border-border bg-surface text-base text-foreground placeholder:text-text-muted focus:border-brand",
              section: "text-text-muted",
            }}
            styles={{
              root: {
                height: 45,
              },
              input: {
                paddingTop: 7,
                paddingBottom: 7,
                height: 45,
              },
            }}
            leftSection={<HiOutlineMagnifyingGlass className="size-5" />}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            placeholder={placeholder}
            value={searchValue}
          />
        </div>

        <div className="flex items-stretch gap-2 sm:justify-end lg:justify-end">
          {filterFields.length ? (
            isMobile ? (
              <>
                {filterTrigger}
                <Modal
                  centered
                  classNames={{
                    body: "px-4 pb-5 sm:px-6 sm:pb-6",
                    content: "rounded-sm",
                    title: "text-[18px] font-semibold sm:text-[22px]",
                  }}
                  styles={{
                    title: {
                      fontWeight: "bold",
                      width: "100%",
                      textAlign: "center",
                      fontSize: 18
                    }
                  }}
                  onClose={() => setFiltersOpened(false)}
                  opened={filtersOpened}
                  padding={0}
                  radius="lg"
                  size="calc(100vw - 1.5rem)"
                  title={t("actions.filter")}
                >
                  {filterContent}
                </Modal>
              </>
            ) : (
              <Popover
                onChange={setFiltersOpened}
                opened={filtersOpened}
                position="bottom-end"
                shadow="md"
                width={440}
              >
                <Popover.Target>{filterTrigger}</Popover.Target>
                <Popover.Dropdown className="overflow-hidden rounded-xl border border-border bg-surface p-0 shadow-panel">
                  {filterContent}
                </Popover.Dropdown>
              </Popover>
            )
          ) : null}
          {addLabel ? (
            <button
              className="h-12 rounded-md bg-[#12A15E] px-[12px] py-[8px] text-white shadow-card"
              onClick={onAdd}
              style={{ fontSize: 13 }}
              type="button"
            >
              {addLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
