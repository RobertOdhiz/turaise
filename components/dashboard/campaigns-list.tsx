"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { formatCurrency, calculateProgress } from "@/lib/utils"
import { Download, Eye } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import to avoid SSR issues with @react-pdf/renderer
const CampaignReportModal = dynamic(
  () => import("@/components/dashboard/campaign-report-modal"),
  {
    ssr: false,
  }
)

interface Campaign {
  id: string
  slug: string
  title: string
  goal_amount: number
  current_amount: number
  description: string
  image_url: string | null
  status: string
  created_at: string
}

interface CampaignsListProps {
  campaigns: Campaign[]
}

export function CampaignsList({ campaigns }: CampaignsListProps) {
  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any campaigns yet.
          </p>
          <Link href="/dashboard/create">
            <Button>Create Your First Campaign</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => {
        const progress = calculateProgress(
          Number(campaign.current_amount),
          Number(campaign.goal_amount)
        )

        return (
          <Card key={campaign.id} className="flex flex-col">
            {campaign.image_url && (
              <div className="relative h-48 w-full">
                <Image
                  src={campaign.image_url}
                  alt={campaign.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {campaign.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(campaign.current_amount))} /{" "}
                    {formatCurrency(Number(campaign.goal_amount))}
                  </span>
                </div>
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-right">
                  {progress}% funded
                </p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link href={`/campaign/${campaign.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                <CampaignReportModal campaignId={campaign.id}>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </CampaignReportModal>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

