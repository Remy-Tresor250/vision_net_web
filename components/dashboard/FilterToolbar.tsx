"use client";

import { Popover, Select, TextInput } from "@mantine/core";
import { DatePickerInput, MonthPickerInput } from "@mantine/dates";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useEffectEvent, useState } from "react";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSparkles,
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
  placeholder: string;
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  filters?: Record<string, string>;
  onFiltersChange?: (value: Record<string, string>) => void;
  filterFields?: FilterField[];
  addLabel?: string;
  onAdd?: () => void;
  className?: string;
}

export default function FilterToolbar({
  addLabel,
  className,
  filterFields = [],
  filters = {},
  onAdd,
  onFiltersChange,
  onQueryChange,
  placeholder,
  query,
  title
}: Props) {
  const { t, i18n } = useTranslation();
  const [searchValue, setSearchValue] = useState(query);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>(filters);
  const [debouncedQuery] = useDebouncedValue(searchValue, 400);
  const emitQueryChange = useEffectEvent(onQueryChange);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (debouncedQuery === query) return;

    emitQueryChange(debouncedQuery);
  }, [debouncedQuery, query]);

  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    const pendingFilters = JSON.stringify(draftFilters);

    if (currentFilters === pendingFilters) return;

    onFiltersChange?.(draftFilters);
  }, [draftFilters, filters, onFiltersChange]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function updateDraftFilter(id: string, value: string | null) {
    setDraftFilters((current) => ({
      ...current,
      [id]: value ?? "",
    }));
  }

  function applyFilters() {
    setPopoverOpened(false);
  }

  function clearFilters() {
    const cleared = Object.fromEntries(
      Object.keys(draftFilters).map((key) => [key, ""]),
    );
    setDraftFilters(cleared);
    onFiltersChange?.(cleared);
    setPopoverOpened(false);
  }

  return (
    <div className={cn("w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className)}>
      <h2 className="text-[27px] font-medium text-[#0A3B24]">{title}</h2>
      <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center lg:justify-end">
        <div className="w-full sm:w-[30vw]">
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

        <div className="flex items-stretch gap-2 lg:justify-end">
          {filterFields.length ? (
            <Popover
              onChange={setPopoverOpened}
              opened={popoverOpened}
              position="bottom-end"
              shadow="md"
              width={440}
            >
              <Popover.Target>
                <button
                  className="flex h-12 items-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-medium text-foreground shadow-card hover:bg-surface-muted"
                  onClick={() => setPopoverOpened((current) => !current)}
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
              </Popover.Target>
              <Popover.Dropdown className="overflow-hidden rounded-xl border border-border bg-surface p-0 shadow-panel">
                <div className="border-b border-border bg-surface-muted px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-card">
                      <HiOutlineSparkles className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("actions.filter")}
                      </p>
                      <p className="text-xs text-text-muted">
                        {t("filters.refineCurrentList")}
                      </p>
                    </div>
                  </div>
                </div>
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
                              value
                                ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
                                : "",
                            )
                          }
                          placeholder={field.placeholder ?? field.label}
                          styles={appFieldStyles}
                          value={draftFilters[field.id] ? new Date(draftFilters[field.id]) : null}
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
                              value
                                ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`
                                : "",
                            )
                          }
                          placeholder={field.placeholder ?? field.label}
                          styles={appFieldStyles}
                          value={draftFilters[field.id] ? new Date(`${draftFilters[field.id]}-01`) : null}
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
                <div className="flex justify-end gap-3 border-t border-border bg-surface-muted px-5 py-4">
                  <button
                    className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
                    onClick={clearFilters}
                    type="button"
                  >
                    {t("filters.clear")}
                  </button>
                  <button
                    className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
                    onClick={applyFilters}
                    type="button"
                  >
                    {t("filters.apply")}
                  </button>
                </div>
              </Popover.Dropdown>
            </Popover>
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
