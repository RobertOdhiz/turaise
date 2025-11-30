import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createWithdrawalRequest } from "@/lib/db/queries"

/**
 * POST /api/withdraw
 * Create a withdrawal request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaign_id, amount, bank_account, reason } = body

    if (!campaign_id || !amount || !bank_account || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const withdrawalRequest = await createWithdrawalRequest({
      campaign_id,
      user_id: session.user.id,
      amount: Number(amount),
      bank_account,
      reason,
    })

    return NextResponse.json({ withdrawalRequest })
  } catch (error: any) {
    console.error("Error creating withdrawal request:", error)
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    )
  }
}

