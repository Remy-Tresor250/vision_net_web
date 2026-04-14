import leafLogo from "@/assets/svgs/leaf_logo.svg";
import Image from "next/image";

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-13 items-center justify-center rounded-md bg-brand text-white shadow-card">
        <Image src={leafLogo} alt="logo" className="w-[28px] h-[28px]" />
      </div>
      <div>
        <p className="text-[28px] font-semibold -mb-[12px] text-foreground">
          Vision Net
        </p>
        <p className="mt-1 text-[11px] text-text-muted">Admin panel</p>
      </div>
    </div>
  );
}
