"use client";

import PhoneInput from "react-phone-input-2";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function PhoneNumberInput({
  className,
  disabled,
  error,
  label,
  onChange,
  placeholder,
  required,
  value,
}: Props) {
  const { t } = useTranslation();
  const normalizedValue = value.replace(/\s+/g, "");
  const country =
    normalizedValue.startsWith("+243") || normalizedValue.startsWith("243")
      ? "cd"
      : "rw";

  return (
    <div className={cn("app-phone-field", className)}>
      <p className="app-field-label">Phone Number</p>
      <PhoneInput
        buttonClass="app-phone-button"
        containerClass="app-phone-input"
        country={country}
        disableCountryCode={false}
        disableDropdown={false}
        enableAreaCodes={false}
        enableLongNumbers
        disabled={disabled}
        inputClass="app-phone-control"
        inputProps={{ required }}
        localization={{
          cd: "DRC",
          rw: "RWA",
        }}
        onlyCountries={["cd", "rw"]}
        onChange={(nextValue) => onChange(nextValue ? `+${nextValue}` : "")}
        placeholder={placeholder}
        preferredCountries={["cd"]}
        specialLabel={label}
        value={value}
      />
      {error ? <p className="app-field-error">{error}</p> : null}
      <span className="sr-only">
        {t("common.countryCode")} {t("common.phone")}
      </span>
    </div>
  );
}
