import type { Metadata } from "next";

import ReceiptVerificationPage from "@/components/public/ReceiptVerificationPage";

interface Props {
  params: Promise<{ receiptId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { receiptId } = await params;

  return {
    title: "Vérification de reçu | Vision Net",
    description: `Vérifiez l'authenticité du reçu Vision Net ${receiptId}.`,
  };
}

export default async function PublicReceiptVerificationRoute({ params }: Props) {
  const { receiptId } = await params;

  return <ReceiptVerificationPage receiptId={receiptId} />;
}
