import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { donationSchema } from "@/lib/validations"
import { getCampaignById, createDonation, createAuditLog } from "@/lib/db/queries"
import { prisma } from "@/lib/db/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

/**
 * POST /api/donate/stripe
 * Create Stripe Checkout session for donation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, amount, donor_name, donor_email } = body

    // Validate input
    const validation = donationSchema.safeParse({
      amount,
      donor_name,
      donor_email,
      payment_method: "card" as const,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await getCampaignById(campaign_id)
    
    if (!campaign || campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Get client IP
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Create donation record (unverified)
    let donation
    try {
      donation = await createDonation({
        campaign_id,
        donor_name: donor_name || null,
        donor_email: donor_email || null,
        amount,
        payment_method: "card",
        ip_address: clientIp,
      })
    } catch (error) {
      console.error("Error creating donation:", error)
      return NextResponse.json(
        { error: "Failed to create donation record" },
        { status: 500 }
      )
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: {
              name: `Donation to ${campaign.title}`,
              description: `Supporting ${campaign.title}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaign.slug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaign.slug}?canceled=true`,
      metadata: {
        donation_id: donation.id,
        campaign_id: campaign.id,
      },
      customer_email: donor_email || undefined,
    })

    // Update donation with session ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: { payment_id: session.id },
    })

    // Log audit
    await createAuditLog({
      campaign_id,
      action: "donation",
      details: {
        donation_id: donation.id,
        amount,
        payment_method: "card",
        status: "pending",
        stripe_session_id: session.id,
      },
      ip_address: clientIp,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    )
  }
}

