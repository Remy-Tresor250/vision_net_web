import type { Metadata } from "next";

import ClientDetailsPanel from "@/components/dashboard/ClientDetailsPanel";

interface Props {
  params: Promise<{ clientId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Client Details | Vision Net",
    description: "Payment details for a Vision Net client.",
  };
}

export default async function ClientDetailsPage({ params }: Props) {
  const { clientId } = await params;

  return <ClientDetailsPanel clientId={clientId} />;
}
