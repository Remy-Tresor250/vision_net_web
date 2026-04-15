"use client";

import { TextInput } from "@mantine/core";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";


interface Props {
  placeholder: string;
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  addLabel?: string;
  onAdd?: () => void;
  className?: string;
}

export default function FilterToolbar({
  addLabel,
  onAdd,
  onQueryChange,
  placeholder,
  query,
  title
}: Props) {
  return (
    <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-[27px] font-medium text-[#0A3B24]">{title}</h2>
      <div className="flex flex-row items-center justify-end flex-1 gap-[10px]">
        <div className="w-[70%] lg:max-w-3xl">
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
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder={placeholder}
            value={query}
          />
        </div>

        <div className="flex flex-wrap items-stretch gap-2">
          <button className="px-[12px] py-[8px] flex flex-row items-center border-[#E2E8E4] border-[1px] border-solid bg-[#F8FAF9] gap-[3px] rounded-[6px]">
            <HiOutlineAdjustmentsHorizontal
              className="size-5"
              color="#6B7C72"
            />
            Filter
          </button>
          {addLabel ? (
            <button
              className="px-[12px] py-[8px] bg-[#12A15E] rounded-[6px] text-white"
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
