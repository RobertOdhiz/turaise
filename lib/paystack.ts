import axios from "axios"
import crypto from "crypto"

/**
 * Initialize Paystack payment transaction
 */
export async function initializePaystackTransaction(
  email: string,
  amount: number, // Amount in kobo (smallest currency unit) - for Naira, or in cents for other currencies
  reference: string,
  metadata?: Record<string, any>
): Promise<any> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey || secretKey.includes("your_") || (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_"))) {
    throw new Error(
      "Paystack credentials not configured. Please set PAYSTACK_SECRET_KEY in your .env.local file. " +
      "Get it from https://dashboard.paystack.com/#/settings/developer"
    )
  }

  // Convert amount to kobo (multiply by 100 for Naira)
  // For other currencies, adjust accordingly
  const amountInKobo = Math.round(amount * 100)

  const url = "https://api.paystack.co/transaction/initialize"

  const payload = {
    email,
    amount: amountInKobo,
    reference,
    callback_url: process.env.PAYSTACK_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/donate/paystack/callback`,
    metadata: metadata || {},
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to initialize Paystack transaction")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(
        "Invalid Paystack credentials. Please check your PAYSTACK_SECRET_KEY. " +
        "Get it from https://dashboard.paystack.com/#/settings/developer"
      )
    }
    throw error
  }
}

/**
 * Verify Paystack transaction
 */
export async function verifyPaystackTransaction(reference: string): Promise<any> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    throw new Error("Paystack credentials not configured")
  }

  const url = `https://api.paystack.co/transaction/verify/${reference}`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    })

    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Invalid Paystack credentials")
    }
    throw error
  }
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(body: string, signature: string): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    return false
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex")

  return hash === signature
}

