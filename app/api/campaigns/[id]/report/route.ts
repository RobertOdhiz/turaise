import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCampaignById, getDonationsByCampaign } from "@/lib/db/queries"

/**
 * GET /api/campaigns/[id]/report
 * Get campaign and donations data for report generation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    // Fetch campaign
    const campaign = await getCampaignById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Verify user owns the campaign
    if (campaign.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch donations
    const donations = await getDonationsByCampaign(campaignId, 1000) // Get all donations for report

    return NextResponse.json({
      campaign,
      donations,
    })
  } catch (error: any) {
    console.error("Error fetching campaign report data:", error)
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    )
  }
}

