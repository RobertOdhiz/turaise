import { notFound } from "next/navigation"
import { getCampaignBySlug, getDonationsByCampaign } from "@/lib/db/queries"
import { prisma } from "@/lib/db/prisma"
import { sanitizeHtml } from "@/lib/utils"
import { CampaignView } from "@/components/campaign/campaign-view"
import { DonationForm } from "@/components/campaign/donation-form"
import type { Campaign } from "@prisma/client"

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  // Handle Next.js 14+ params (can be Promise)
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams.slug

  // Decode URL-encoded slug in case of special characters
  const decodedSlug = decodeURIComponent(slug)

  // Try to find the campaign by slug (active campaigns)
  let campaign = await getCampaignBySlug(decodedSlug)

  // If not found with status filter, try without status filter
  if (!campaign) {
    campaign = await prisma.campaign.findUnique({
      where: { slug: decodedSlug },
    })
    
    if (!campaign) {
      console.error("Campaign not found. Slug:", decodedSlug)
      notFound()
    }
    
    console.error("Campaign found but status is:", campaign.status)
  }

  // Fetch verified donations
  const donations = await getDonationsByCampaign(campaign.id, 50)

  // Sanitize description on server side to prevent hydration mismatch
  const sanitizedDescription = await sanitizeHtml(campaign.description)

  // Create campaign object with sanitized description and convert types
  const campaignWithSanitizedDescription = {
    ...campaign,
    description: sanitizedDescription,
    goal_amount: Number(campaign.goal_amount),
    current_amount: Number(campaign.current_amount),
    created_at: campaign.created_at.toISOString(),
    slug: campaign.slug,
  }

  // Convert donations to match component interface
  const formattedDonations = (donations || []).map((donation) => ({
    ...donation,
    amount: Number(donation.amount),
    created_at: donation.created_at.toISOString(),
  }))

  return (
    <div className="min-h-screen">
      <CampaignView 
        campaign={campaignWithSanitizedDescription} 
        donations={formattedDonations} 
      />
      <DonationForm campaignId={campaign.id} />
    </div>
  )
}

