import type { Metadata } from "next";

import ReceiptVerificationPage from "@/components/public/ReceiptVerificationPage";

interface Props {
  params: Promise<{ receiptId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { receiptId } = await params;

  return {
    title: "Receipt Verification | Vision Net",
    description: `Verify the authenticity of Vision Net receipt ${receiptId}.`,
  };
}

export default async function PublicReceiptVerificationRoute({ params }: Props) {
  const { receiptId } = await params;

  return <ReceiptVerificationPage receiptId={receiptId} />;
}
