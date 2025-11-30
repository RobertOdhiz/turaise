import { NextRequest, NextResponse } from "next/server"
import { getCampaignById, getDonationsByCampaign } from "@/lib/db/queries"
import { sanitizeHtml } from "@/lib/utils"

/**
 * GET /api/campaigns/[id]
 * Get campaign and donations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    const campaign = await getCampaignById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const donations = await getDonationsByCampaign(campaignId, 50)

    // Sanitize description to prevent XSS and ensure consistency
    const sanitizedDescription = await sanitizeHtml(campaign.description)
    const campaignWithSanitizedDescription = {
      ...campaign,
      description: sanitizedDescription,
    }

    return NextResponse.json({ campaign: campaignWithSanitizedDescription, donations })
  } catch (error: any) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    )
  }
}

