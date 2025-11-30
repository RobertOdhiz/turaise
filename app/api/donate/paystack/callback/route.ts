import { NextRequest, NextResponse } from "next/server"
import { verifyPaystackWebhook, verifyPaystackTransaction } from "@/lib/paystack"
import { sendDonationEmail } from "@/lib/email"
import { getDonationByPaymentId, verifyDonation, createAuditLog } from "@/lib/db/queries"
import { prisma } from "@/lib/db/prisma"

/**
 * GET /api/donate/paystack/callback
 * Handle Paystack payment callback (redirect after payment)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.redirect(new URL("/campaigns?error=no_reference", request.url))
    }

    // Verify transaction
    const verification = await verifyPaystackTransaction(reference)

    if (!verification.status) {
      return NextResponse.redirect(new URL(`/campaigns?error=verification_failed&message=${encodeURIComponent(verification.message)}`, request.url))
    }

    // Find donation by reference
    const donation = await getDonationByPaymentId(reference)

    if (!donation) {
      console.error("Donation not found:", reference)
      return NextResponse.redirect(new URL("/campaigns?error=donation_not_found", request.url))
    }

    const transaction = verification.data

    if (transaction.status === "success") {
      // Payment successful
      // Update donation as verified
      await verifyDonation(donation.id, reference)

      // Get campaign for email
      const campaign = await prisma.campaign.findUnique({
        where: { id: donation.campaign_id },
      })

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
          payment_method: "paystack",
          status: "verified",
          reference,
          transaction_id: transaction.id,
        },
      })

      return NextResponse.redirect(new URL(`/campaign/${campaign?.slug || ""}?donation=success`, request.url))
    } else {
      // Payment failed
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          payment_id: `FAILED-${reference}`,
        },
      })

      console.error("Paystack payment failed:", transaction.gateway_response)
      return NextResponse.redirect(new URL(`/campaigns?error=payment_failed&message=${encodeURIComponent(transaction.gateway_response || "Payment failed")}`, request.url))
    }
  } catch (error: any) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/campaigns?error=internal_error", request.url))
  }
}

/**
 * POST /api/donate/paystack/callback
 * Handle Paystack webhook (for server-to-server notifications)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature") || ""

    // Verify webhook signature
    if (!verifyPaystackWebhook(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle different event types
    if (event.event === "charge.success") {
      const transaction = event.data
      const reference = transaction.reference

      // Find donation by reference
      const donation = await getDonationByPaymentId(reference)

      if (!donation) {
        console.error("Donation not found:", reference)
        return NextResponse.json({ error: "Donation not found" }, { status: 404 })
      }

      // Update donation as verified
      await verifyDonation(donation.id, reference)

      // Get campaign for email
      const campaign = await prisma.campaign.findUnique({
        where: { id: donation.campaign_id },
      })

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
          payment_method: "paystack",
          status: "verified",
          reference,
          transaction_id: transaction.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

