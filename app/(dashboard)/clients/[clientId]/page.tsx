import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ClientDetailsPanel from "@/components/dashboard/ClientDetailsPanel";
import { getClientById, getPaymentsForClient } from "@/constants";

interface Props {
  params: Promise<{ clientId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clientId } = await params;
  const client = getClientById(clientId);

  if (!client) {
    return {
      title: "Client Not Found | Vision Net",
    };
  }

  return {
    title: `${client.name} | Vision Net`,
    description: `Payment details for ${client.name}.`,
  };
}

export default async function ClientDetailsPage({ params }: Props) {
  const { clientId } = await params;
  const client = getClientById(clientId);

  if (!client) {
    notFound();
  }

  return (
    <ClientDetailsPanel client={client} payments={getPaymentsForClient(client.id)} />
  );
}
