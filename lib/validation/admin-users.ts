import { z } from "zod";

import { CLIENT_TYPES } from "@/lib/client-type";

const baseUserFormSchema = z.object({
  fullNames: z.string().min(2, "Enter the full name"),
  phone: z.string().min(7, "Enter a valid phone number").max(32),
});

export const agentFormSchema = baseUserFormSchema.extend({
  avenueIds: z.array(z.string()).default([]),
});

export const clientFormSchema = baseUserFormSchema.extend({
  avenueId: z.string().min(1, "Select an avenue"),
  clientType: z.enum(CLIENT_TYPES),
  code: z.string().optional().or(z.literal("")),
  quartierId: z.string().min(1, "Select a quartier"),
  registeredDate: z.string().optional(),
  serineId: z.string().min(1, "Select a serine"),
  serviceTypeId: z.string().optional().or(z.literal("")),
  subscriptionAmount: z.string().optional().or(z.literal("")),
}).superRefine((value, context) => {
  if (value.clientType === "NORMAL" && !value.serviceTypeId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a service type",
      path: ["serviceTypeId"],
    });
  }

  if (value.clientType === "POTENTIAL") {
    const amount = Number(value.subscriptionAmount);

    if (!value.subscriptionAmount || Number.isNaN(amount) || amount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid subscription amount",
        path: ["subscriptionAmount"],
      });
    }
  }
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;
