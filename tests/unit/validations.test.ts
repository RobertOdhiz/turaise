import { describe, it, expect } from "@jest/globals"
import { donationSchema, campaignSchema } from "@/lib/validations"

describe("Validation Schemas", () => {
  describe("donationSchema", () => {
    it("should validate a valid donation", () => {
      const validDonation = {
        amount: 500,
        donor_name: "John Doe",
        donor_email: "john@example.com",
        donor_phone: "254712345678",
        payment_method: "paystack" as const,
      }

      const result = donationSchema.safeParse(validDonation)
      expect(result.success).toBe(true)
    })

    it("should reject amount less than 100", () => {
      const invalidDonation = {
        amount: 50,
        payment_method: "paystack" as const,
      }

      const result = donationSchema.safeParse(invalidDonation)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("100")
      }
    })

    it("should reject invalid email", () => {
      const invalidDonation = {
        amount: 500,
        donor_email: "invalid-email",
        payment_method: "card" as const,
      }

      const result = donationSchema.safeParse(invalidDonation)
      expect(result.success).toBe(false)
    })
  })

  describe("campaignSchema", () => {
    it("should validate a valid campaign", () => {
      const validCampaign = {
        title: "Help John's Medical Treatment",
        goal_amount: 100000,
        description: "This is a detailed description of the campaign that explains the need for funds.",
        category: "medical" as const,
      }

      const result = campaignSchema.safeParse(validCampaign)
      expect(result.success).toBe(true)
    })

    it("should reject title less than 5 characters", () => {
      const invalidCampaign = {
        title: "Hi",
        goal_amount: 100000,
        description: "This is a detailed description.",
        category: "medical" as const,
      }

      const result = campaignSchema.safeParse(invalidCampaign)
      expect(result.success).toBe(false)
    })
  })
})

