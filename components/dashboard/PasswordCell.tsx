"use client";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/Button";

const DEFAULT_PASSWORD = "Svn@2026!";

interface Props {
  canReset?: boolean;
  isDefaultPass?: boolean;
  isResetting?: boolean;
  onReset?: () => void;
}

export default function PasswordCell({
  canReset = false,
  isDefaultPass = false,
  isResetting = false,
  onReset,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center gap-2">
      <span className="text-[12px] flex-1 text-center text-text-muted">
        {isDefaultPass ? DEFAULT_PASSWORD : t("common.passwordHidden")}
      </span>
      {canReset && onReset ? (
        <Button
          aria-label={t("common.resetPassword")}
          disabled={isResetting}
          onClick={onReset}
          size="icon"
          title={t("common.resetPassword")}
          variant="subtle"
        >
          <HiOutlineArrowPath className={`size-4 ${isResetting ? "animate-spin" : ""}`} />
        </Button>
      ) : null}
    </div>
  );
}
