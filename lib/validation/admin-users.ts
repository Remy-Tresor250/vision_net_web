import { z } from "zod";

export const agentFormSchema = z.object({
  fullNames: z.string().min(2, "Enter the full name"),
  language: z.enum(["en", "fr"]),
  phone: z.string().min(7, "Enter a valid phone number").max(32),
});

export const clientFormSchema = agentFormSchema.extend({
  address: z.string().min(2, "Enter the client address"),
  registeredDate: z.string().optional(),
  subscriptionAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Use a valid amount"),
  type: z.enum(["NORMAL", "POTENTIEL"]),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;
