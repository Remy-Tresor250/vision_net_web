import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AgentDetailsPanel from "@/components/dashboard/AgentDetailsPanel";
import { getAgentById, getPaymentsForAgent } from "@/constants";

interface Props {
  params: Promise<{ agentId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { agentId } = await params;
  const agent = getAgentById(agentId);

  if (!agent) {
    return {
      title: "Agent Not Found | Vision Net",
    };
  }

  return {
    title: `${agent.name} | Vision Net`,
    description: `Agent overview for ${agent.name}.`,
  };
}

export default async function AgentDetailsPage({ params }: Props) {
  const { agentId } = await params;
  const agent = getAgentById(agentId);

  if (!agent) {
    notFound();
  }

  return <AgentDetailsPanel agent={agent} payments={getPaymentsForAgent(agent.id)} />;
}
