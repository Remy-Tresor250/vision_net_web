import leafLogo from "@/assets/svgs/leaf_logo.svg";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function AppLogo() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-13 items-center justify-center rounded-md bg-brand text-white shadow-card">
        <Image src={leafLogo} alt="logo" className="w-[28px] h-[28px]" />
      </div>
      <div>
        <p className="text-[18px] font-semibold -mb-[12px] text-foreground">
          Société Vision Net
        </p>
        <p className="mt-2 text-[11px] text-text-muted">
          {t("auth.adminPanel")}
        </p>
      </div>
    </div>
  );
}
