import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number").max(32),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  code: z.string().length(6, "Enter the 6 digit code").optional().or(z.literal("")),
  otpSessionId: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  phone: z.string().min(7, "Enter a valid phone number").max(32),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
  oldPassword: z.string().min(8, "Enter your current password").max(128),
  otpSessionId: z.string().min(1, "Request and verify an OTP first"),
});

export const phoneChangeSchema = z.object({
  code: z.string().length(6, "Enter the 6 digit code").optional().or(z.literal("")),
  fullNames: z.string().min(2, "Enter your full name").optional().or(z.literal("")),
  otpSessionId: z.string().optional(),
  phone: z.string().min(7, "Enter a valid phone number").max(32),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type PhoneChangeFormValues = z.infer<typeof phoneChangeSchema>;
