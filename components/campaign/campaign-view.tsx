"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Share2, Heart } from "lucide-react"
import { formatCurrency, calculateProgress, sanitizeHtml, formatDateReadable } from "@/lib/utils"
import { ShareButtons } from "@/components/campaign/share-buttons"

interface Campaign {
  id: string
  title: string
  slug: string
  goal_amount: number
  current_amount: number
  description: string
  image_url: string | null
  category: string
  created_at: string
}

interface Donation {
  id: string
  donor_name: string | null
  amount: number
  created_at: string
}

interface CampaignViewProps {
  campaign: Campaign
  donations: Donation[]
}

export function CampaignView({ campaign: initialCampaign, donations: initialDonations }: CampaignViewProps) {
  const [campaign, setCampaign] = useState(initialCampaign)
  const [donations, setDonations] = useState(initialDonations)

  useEffect(() => {
    // Poll for updates every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaign.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.campaign) {
            setCampaign(data.campaign)
            setDonations(data.donations || [])
          }
        }
      } catch (error) {
        console.error("Error fetching campaign updates:", error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [campaign.id])

  const progress = calculateProgress(
    Number(campaign.current_amount),
    Number(campaign.goal_amount)
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {campaign.image_url && (
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-6">
          <Image
            src={campaign.image_url}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{campaign.title}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {campaign.category}
            </span>
            <span className="text-sm text-muted-foreground">
              Created {formatDateReadable(campaign.created_at)}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(Number(campaign.current_amount))}
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Goal: {formatCurrency(Number(campaign.goal_amount))}
                </span>
                <span className="font-semibold">{progress}% funded</span>
              </div>
            </div>
            <ShareButtons campaign={campaign} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            />
          </CardContent>
        </Card>

        {donations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Recent Donations ({donations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {donations.slice(0, 10).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {donation.donor_name || "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateReadable(donation.created_at)}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(Number(donation.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

