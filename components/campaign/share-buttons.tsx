"use client"

import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Campaign {
  id: string
  title: string
  slug: string
}

interface ShareButtonsProps {
  campaign: Campaign
}

export function ShareButtons({ campaign }: ShareButtonsProps) {
  // Use environment variable or construct URL safely
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  const campaignUrl = `${baseUrl}/campaign/${campaign.slug}`
  const shareText = `Help support ${campaign.title}! Check out this campaign: ${campaignUrl}`

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: shareText,
          url: campaignUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(campaignUrl)
      toast({
        title: "Link copied",
        description: "Campaign link copied to clipboard!",
      })
    }
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Support ${campaign.title}`)
    const body = encodeURIComponent(shareText)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleWebShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={handleWhatsApp}>
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={handleEmail}>
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
    </div>
  )
}

