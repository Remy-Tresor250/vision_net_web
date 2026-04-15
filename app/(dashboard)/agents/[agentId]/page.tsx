import type { Metadata } from "next";

import AgentDetailsPanel from "@/components/dashboard/AgentDetailsPanel";

interface Props {
  params: Promise<{ agentId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Agent Details | Vision Net",
    description: "Agent overview for Vision Net.",
  };
}

export default async function AgentDetailsPage({ params }: Props) {
  const { agentId } = await params;

  return <AgentDetailsPanel agentId={agentId} />;
}
