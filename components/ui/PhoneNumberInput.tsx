"use client";

import { useMemo, useState } from "react";
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

const DEFAULT_COUNTRY = "cd";
const COUNTRY_DIAL_CODES = {
  cd: "243",
  rw: "250",
} as const;
const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_DIAL_CODES) as Array<
  keyof typeof COUNTRY_DIAL_CODES
>;

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function detectCountryFromValue(value: string) {
  const normalizedValue = normalizeDigits(value);

  if (normalizedValue.startsWith(COUNTRY_DIAL_CODES.cd)) {
    return "cd" as const;
  }

  if (normalizedValue.startsWith(COUNTRY_DIAL_CODES.rw)) {
    return "rw" as const;
  }

  return null;
}

function stripSupportedCountryCode(value: string, selectedDialCode: string) {
  let digits = normalizeDigits(value);

  if (digits.startsWith(selectedDialCode)) {
    digits = digits.slice(selectedDialCode.length);
  }

  const mismatchedCountryCode = Object.values(COUNTRY_DIAL_CODES).find(
    (dialCode) => dialCode !== selectedDialCode && digits.startsWith(dialCode),
  );

  if (mismatchedCountryCode) {
    digits = digits.slice(mismatchedCountryCode.length);
  }

  return digits.replace(/^0+/, "");
}

function normalizePhoneValue(
  value: string,
  fallbackCountry: keyof typeof COUNTRY_DIAL_CODES,
) {
  const resolvedCountry = detectCountryFromValue(value) ?? fallbackCountry;
  const dialCode = COUNTRY_DIAL_CODES[resolvedCountry];
  const nationalNumber = stripSupportedCountryCode(value, dialCode);

  return nationalNumber ? `+${dialCode}${nationalNumber}` : `+${dialCode}`;
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
  const inferredCountry = useMemo(() => detectCountryFromValue(value), [value]);
  const [selectedCountry, setSelectedCountry] = useState<
    keyof typeof COUNTRY_DIAL_CODES
  >(inferredCountry ?? DEFAULT_COUNTRY);
  const activeCountry = inferredCountry ?? selectedCountry;
  const dialCode = COUNTRY_DIAL_CODES[activeCountry];
  const displayValue = useMemo(
    () => normalizePhoneValue(value, activeCountry),
    [activeCountry, value],
  );

  return (
    <div className={cn("app-phone-field", className)}>
      <p className="app-field-label">{label}</p>
      <PhoneInput
        buttonClass="app-phone-button"
        containerClass="app-phone-input"
        country={activeCountry}
        countryCodeEditable={false}
        disableCountryCode={false}
        disableCountryGuess
        disableDropdown={false}
        disableInitialCountryGuess
        enableAreaCodes={false}
        enableLongNumbers
        disabled={disabled}
        inputClass="app-phone-control"
        inputProps={{ required }}
        localization={{
          cd: "DRC",
          rw: "RWA",
        }}
        onlyCountries={SUPPORTED_COUNTRIES}
        onChange={(nextValue, countryData) => {
          const nextCountry = (countryData?.countryCode ??
            activeCountry) as keyof typeof COUNTRY_DIAL_CODES;
          const nextDialCode = COUNTRY_DIAL_CODES[nextCountry] ?? dialCode;
          const nationalNumber = stripSupportedCountryCode(nextValue, nextDialCode);

          setSelectedCountry(nextCountry);
          onChange(nationalNumber ? `+${nextDialCode}${nationalNumber}` : "");
        }}
        placeholder={placeholder}
        preferredCountries={["cd"]}
        specialLabel={label}
        value={displayValue}
      />
      {error ? <p className="app-field-error">{error}</p> : null}
      <span className="sr-only">
        {t("common.countryCode")} {t("common.phone")}
      </span>
    </div>
  );
}
