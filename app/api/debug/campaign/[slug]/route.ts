import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

/**
 * Debug endpoint to check campaign by slug
 * GET /api/debug/campaign/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const slug = resolvedParams.slug

    // Try exact match
    let exactMatch = null
    let exactError = null
    try {
      exactMatch = await prisma.campaign.findUnique({
        where: { slug },
      })
    } catch (error: any) {
      exactError = error.message
    }

    // Try case-insensitive (using raw SQL for case-insensitive search)
    let caseInsensitive: any[] = []
    let caseError = null
    try {
      caseInsensitive = await prisma.$queryRaw`
        SELECT slug, status, title, id
        FROM campaigns
        WHERE LOWER(slug) = LOWER(${slug})
        LIMIT 5
      `
    } catch (error: any) {
      caseError = error.message
    }

    // Get all campaigns to see what slugs exist
    const sampleCampaigns = await prisma.campaign.findMany({
      select: {
        slug: true,
        status: true,
        title: true,
      },
      take: 10,
    })

    return NextResponse.json({
      searchedSlug: slug,
      exactMatch,
      exactError,
      caseInsensitive,
      caseError,
      sampleCampaigns,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

