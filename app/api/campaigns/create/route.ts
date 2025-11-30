import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createCampaign, getCampaignBySlug } from "@/lib/db/queries"
import { generateSlug, sanitizeHtml } from "@/lib/utils"

/**
 * POST /api/campaigns/create
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, goal_amount, description, image_url, category } = body

    // Validate input
    if (!title || !goal_amount || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Sanitize description
    const sanitizedDescription = await sanitizeHtml(description)

    // Generate slug
    let slug = generateSlug(title)
    let counter = 1
    let finalSlug = slug

    // Ensure unique slug
    let existing = await getCampaignBySlug(finalSlug)
    while (existing) {
      finalSlug = `${slug}-${counter}`
      counter++
      existing = await getCampaignBySlug(finalSlug)
    }

    // Create campaign
    const campaign = await createCampaign({
      user_id: session.user.id,
      slug: finalSlug,
      title,
      goal_amount: Number(goal_amount),
      description: sanitizedDescription,
      image_url: image_url || null,
      category,
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}

