import { z } from "zod";

export const agentFormSchema = z.object({
  fullNames: z.string().min(2, "Enter the full name"),
  phone: z.string().min(7, "Enter a valid phone number").max(32),
});

export const clientFormSchema = agentFormSchema.extend({
  avenueId: z.string().min(1, "Select an avenue"),
  code: z.string().optional().or(z.literal("")),
  quartierId: z.string().min(1, "Select a quartier"),
  registeredDate: z.string().optional(),
  serineId: z.string().min(1, "Select a serine"),
  serviceTypeId: z.string().min(1, "Select a service type"),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;
