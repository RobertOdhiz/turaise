import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCampaignsByUserId } from "@/lib/db/queries"
import { CampaignsList } from "@/components/dashboard/campaigns-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  // Fetch user's campaigns using Neon queries
  const campaigns = await getCampaignsByUserId(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your fundraising campaigns
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Campaign
          </Button>
        </Link>
      </div>
      <CampaignsList campaigns={campaigns || []} />
    </div>
  )
}

