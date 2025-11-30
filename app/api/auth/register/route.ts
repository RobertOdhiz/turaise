import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, createAuthUser, getAuthUserByEmail } from "@/lib/db/queries"
import { formatPhoneNumber } from "@/lib/utils"
import { hashPassword } from "@/lib/auth-helpers"
import { randomUUID } from "crypto"

/**
 * POST /api/auth/register
 * Register a new user with password hashing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, phone, full_name } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if auth user already exists
    const existingAuthUser = await getAuthUserByEmail(email)
    if (existingAuthUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate user ID
    const userId = randomUUID()

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user profile in database
    const user = await createUser({
      id: userId,
      email,
      phone: phone ? formatPhoneNumber(phone) : null,
      full_name: full_name || null,
    })

    // Create auth user with password hash
    await createAuthUser({
      user_id: userId,
      email,
      password_hash: passwordHash,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}

