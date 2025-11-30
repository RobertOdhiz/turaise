import { Resend } from "resend"
import { getBaseUrl } from "./url-utils"
import type { NextRequest } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send donation confirmation email
 */
export async function sendDonationEmail(
  donorEmail: string,
  donorName: string,
  campaign: { title: string; slug: string },
  amount: number,
  request?: NextRequest | Request | null
) {
  try {
    const baseUrl = getBaseUrl(request)
    const campaignUrl = `${baseUrl}/campaign/${campaign.slug}`
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@tufund.com",
      to: donorEmail,
      subject: "Thank you for your donation!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Thank you for your donation!</h1>
          <p>Dear ${donorName},</p>
          <p>We are grateful for your generous donation of KSh ${amount.toLocaleString()} to <strong>${campaign.title}</strong>.</p>
          <p>Your contribution makes a real difference and helps us reach our fundraising goal.</p>
          <p>You can view the campaign progress at: <a href="${campaignUrl}">${campaignUrl}</a></p>
          <p>Thank you for your support!</p>
          <p>Best regards,<br>The TuFund Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending donation email:", error)
    // Don't throw - email failure shouldn't break the donation flow
  }
}

/**
 * Send campaign progress email to campaign owner
 */
export async function sendProgressEmail(
  ownerEmail: string,
  ownerName: string,
  campaign: { title: string; current_amount: number; goal_amount: number; slug: string },
  progress: number,
  request?: NextRequest | Request | null
) {
  try {
    const baseUrl = getBaseUrl(request)
    const campaignUrl = `${baseUrl}/campaign/${campaign.slug}`
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@tufund.com",
      to: ownerEmail,
      subject: `Your campaign "${campaign.title}" is ${progress}% funded!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Great progress on your campaign!</h1>
          <p>Dear ${ownerName},</p>
          <p>Your campaign <strong>${campaign.title}</strong> has reached ${progress}% of its goal!</p>
          <p>Current amount raised: KSh ${Number(campaign.current_amount).toLocaleString()}</p>
          <p>Goal: KSh ${Number(campaign.goal_amount).toLocaleString()}</p>
          <p>Keep sharing your campaign to reach your goal!</p>
          <p><a href="${campaignUrl}">View Campaign</a></p>
          <p>Best regards,<br>The TuFund Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending progress email:", error)
  }
}

