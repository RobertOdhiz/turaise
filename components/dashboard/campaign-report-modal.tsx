"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateCampaignReport } from "@/lib/reports"

interface CampaignReportModalProps {
  campaignId: string
  children: React.ReactNode
}

function CampaignReportModalComponent({
  campaignId,
  children,
}: CampaignReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await generateCampaignReport(campaignId)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Campaign Report</DialogTitle>
          <DialogDescription>
            Generate a PDF report for this campaign
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The report will include campaign details, donation summary, and donor
            information.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Download PDF Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const CampaignReportModal = CampaignReportModalComponent
export default CampaignReportModalComponent

