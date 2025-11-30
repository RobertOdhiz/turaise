import { NextRequest, NextResponse } from "next/server"
import { initializePaystackTransaction } from "@/lib/paystack"
import { donationSchema } from "@/lib/validations"
import { getCampaignById, createDonation, createAuditLog } from "@/lib/db/queries"
import { prisma } from "@/lib/db/prisma"
import crypto from "crypto"

/**
 * POST /api/donate/paystack
 * Initialize Paystack payment for donation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, amount, donor_email, donor_name } = body

    // Validate input
    const validation = donationSchema.safeParse({
      amount,
      donor_name,
      donor_email,
      payment_method: "paystack" as const,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Email is required for Paystack
    if (!donor_email) {
      return NextResponse.json(
        { error: "Email is required for Paystack payments" },
        { status: 400 }
      )
    }

    // Get client IP for fraud detection
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Verify campaign exists
    const campaign = await getCampaignById(campaign_id)
    
    if (!campaign || campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Generate unique reference
    const reference = `DONATION-${campaign_id}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`

    // Create donation record (unverified)
    let donation
    try {
      donation = await createDonation({
        campaign_id,
        donor_name: donor_name || null,
        donor_email: donor_email,
        donor_phone: null,
        amount,
        payment_method: "paystack",
        payment_id: reference,
        ip_address: clientIp,
      })
    } catch (error) {
      console.error("Error creating donation:", error)
      return NextResponse.json(
        { error: "Failed to create donation record" },
        { status: 500 }
      )
    }

    // Initialize Paystack transaction
    try {
      const paystackResponse = await initializePaystackTransaction(
        donor_email,
        amount,
        reference,
        {
          donation_id: donation.id,
          campaign_id,
          campaign_title: campaign.title,
          donor_name: donor_name || "Anonymous",
        }
      )

      if (paystackResponse.status && paystackResponse.data) {
        // Log audit
        await createAuditLog({
          campaign_id,
          action: "donation",
          details: {
            donation_id: donation.id,
            amount,
            payment_method: "paystack",
            status: "pending",
            reference,
          },
          ip_address: clientIp,
        })

        return NextResponse.json({
          success: true,
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
        })
      } else {
        // Payment initialization failed
        await prisma.donation.delete({
          where: { id: donation.id },
        })

        return NextResponse.json(
          { 
            error: paystackResponse.message || "Failed to initialize Paystack payment",
            details: "Please check your Paystack credentials in .env.local"
          },
          { status: 400 }
        )
      }
    } catch (error: any) {
      // Clean up donation record
      await prisma.donation.delete({
        where: { id: donation.id },
      })

      console.error("Paystack initialization error:", error)
      
      // Provide helpful error message
      let errorMessage = "Failed to initialize Paystack payment"
      if (error.message?.includes("credentials not configured") || error.message?.includes("Invalid Paystack")) {
        errorMessage = error.message
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid Paystack credentials. Please check your .env.local file and ensure PAYSTACK_SECRET_KEY is set correctly."
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Donation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

