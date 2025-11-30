import { getActiveCampaigns } from "@/lib/db/queries"
import { CampaignsList } from "@/components/dashboard/campaigns-list"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CampaignsPage() {
  // Fetch active campaigns using Prisma
  const campaigns = await getActiveCampaigns(50)

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Campaigns</h1>
        <p className="text-muted-foreground">
          Discover and support fundraising campaigns
        </p>
      </div>
      {campaigns && campaigns.length > 0 ? (
        <CampaignsList campaigns={campaigns.map(c => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          goal_amount: Number(c.goal_amount),
          current_amount: Number(c.current_amount),
          description: c.description,
          image_url: c.image_url,
          status: c.status,
          created_at: c.created_at.toISOString(),
        }))} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No active campaigns at the moment. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

