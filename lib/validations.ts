import { z } from "zod"

/**
 * Validation schemas using Zod
 */

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^254\d{9}$/.test(val.replace(/\D/g, "")),
      "Invalid Kenyan phone number (format: 254XXXXXXXXX)"
    ),
})

export const phoneOTPSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => /^254\d{9}$/.test(val.replace(/\D/g, "")),
      "Invalid Kenyan phone number (format: 254XXXXXXXXX)"
    ),
})

export const campaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  goal_amount: z
    .number()
    .positive("Goal amount must be greater than 0")
    .min(100, "Minimum goal is KSh 100"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  category: z.enum([
    "medical",
    "education",
    "business",
    "emergency",
    "charity",
    "other",
  ]),
})

export const donationSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .min(100, "Minimum donation is KSh 100"),
  donor_name: z.string().optional(),
  donor_email: z.string().email("Invalid email").optional().or(z.literal("")),
  donor_phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^254\d{9}$/.test(val.replace(/\D/g, "")),
      "Invalid Kenyan phone number"
    ),
  payment_method: z.enum(["paystack", "card"]),
})

export const withdrawalRequestSchema = z.object({
  campaign_id: z.string().uuid("Invalid campaign ID"),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .min(100, "Minimum withdrawal is KSh 100"),
  bank_account: z.string().min(10, "Bank account details required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
})

