import leafLogo from "@/assets/svgs/leaf_logo.svg";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function AppLogo({ hideAdmin }: { hideAdmin?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-11 items-center justify-center rounded-md bg-brand text-white shadow-card sm:size-12 xl:size-13">
        <Image src={leafLogo} alt="logo" className="h-6 w-6 sm:h-[26px] sm:w-[26px] xl:h-[28px] xl:w-[28px]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-foreground sm:-mb-[8px] sm:text-[17px] xl:-mb-[12px] xl:text-[18px]">
          Société Vision Net
        </p>
        {!hideAdmin && (
          <p className="mt-1 text-[10px] text-text-muted sm:mt-2 sm:text-[11px]">
            {t("auth.adminPanel")}
          </p>
        )}
      </div>
    </div>
  );
}
