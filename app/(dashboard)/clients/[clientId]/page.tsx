import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
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

  return (
    <PermissionGuard anyOf={["clients.view"]}>
      <ClientDetailsPanel clientId={clientId} />
    </PermissionGuard>
  );
}
