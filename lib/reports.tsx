"use client"

import React from "react"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import { formatCurrency, calculateProgress, formatDateReadable } from "@/lib/utils"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  text: {
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
})

interface CampaignReportProps {
  campaign: any
  donations: any[]
}

const CampaignReportPDF = ({ campaign, donations }: CampaignReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Campaign Report</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Campaign Details</Text>
        <Text style={styles.text}>Title: {campaign.title}</Text>
        <Text style={styles.text}>Category: {campaign.category}</Text>
        <Text style={styles.text}>
          Created: {formatDateReadable(campaign.created_at)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Financial Summary</Text>
        <View style={styles.row}>
          <Text>Goal Amount:</Text>
          <Text>{formatCurrency(Number(campaign.goal_amount))}</Text>
        </View>
        <View style={styles.row}>
          <Text>Amount Raised:</Text>
          <Text>{formatCurrency(Number(campaign.current_amount))}</Text>
        </View>
        <View style={styles.row}>
          <Text>Progress:</Text>
          <Text>
            {calculateProgress(
              Number(campaign.current_amount),
              Number(campaign.goal_amount)
            )}
            %
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Donations ({donations.length})</Text>
        {donations.map((donation, index) => (
          <View key={donation.id} style={styles.row}>
            <Text>
              {index + 1}. {donation.donor_name || "Anonymous"} -{" "}
              {formatCurrency(Number(donation.amount))}
            </Text>
            <Text>{formatDateReadable(donation.created_at)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

/**
 * Generate and download campaign report PDF
 */
export async function generateCampaignReport(campaignId: string) {
  // Fetch campaign and donations from API
  const response = await fetch(`/api/campaigns/${campaignId}/report`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch campaign data")
  }

  const { campaign, donations } = await response.json()

  if (!campaign) {
    throw new Error("Campaign not found")
  }

  // Generate PDF
  const doc = <CampaignReportPDF campaign={campaign} donations={donations || []} />
  const blob = await pdf(doc).toBlob()

  // Download
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `campaign-report-${campaign.slug}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

