import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sendDonationEmail } from "@/lib/email"
import { getDonationByPaymentId, verifyDonation, createAuditLog } from "@/lib/db/queries"
import { prisma } from "@/lib/db/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/donate/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Find donation by session ID
    const donation = await getDonationByPaymentId(session.id)

    if (!donation) {
      console.error("Donation not found:", session.id)
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Get campaign for email
    const campaign = await prisma.campaign.findUnique({
      where: { id: donation.campaign_id },
    })

    // Update donation as verified
    await verifyDonation(donation.id, session.payment_intent as string)

    // Send confirmation emails
    if (donation.donor_email && campaign) {
      await sendDonationEmail(
        donation.donor_email,
        donation.donor_name || "Donor",
        campaign,
        Number(donation.amount),
        request
      )
    }

    // Log audit
    await createAuditLog({
      campaign_id: donation.campaign_id,
      action: "donation",
      details: {
        donation_id: donation.id,
        amount: donation.amount,
        payment_method: "card",
        status: "verified",
        stripe_payment_intent: session.payment_intent,
      },
    })
  }

  return NextResponse.json({ received: true })
}

