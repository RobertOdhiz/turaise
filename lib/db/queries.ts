// Server-only module
import "server-only"
import { prisma } from "./prisma"
import type { 
  User, 
  Campaign, 
  Donation, 
  AuditLog, 
  WithdrawalRequest,
  Prisma 
} from "@prisma/client"

// Re-export Prisma types for convenience
export type { User, Campaign, Donation, AuditLog, WithdrawalRequest } from "@prisma/client"

/**
 * Auth users queries (password storage)
 */
export type AuthUser = {
  id: string
  user_id: string
  email: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  return prisma.authUser.findUnique({
    where: { email },
  })
}

export async function getAuthUserByUserId(userId: string): Promise<AuthUser | null> {
  return prisma.authUser.findUnique({
    where: { user_id: userId },
  })
}

export async function createAuthUser(data: {
  user_id: string
  email: string
  password_hash: string
}): Promise<AuthUser> {
  return prisma.authUser.create({
    data,
  })
}

/**
 * User queries
 */
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(data: {
  id: string
  email: string
  phone?: string | null
  full_name?: string | null
}): Promise<User> {
  return prisma.user.create({
    data: {
      id: data.id,
      email: data.email,
      phone: data.phone || null,
      full_name: data.full_name || null,
    },
  })
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: {
      phone: data.phone,
      full_name: data.full_name,
    },
  })
}

/**
 * Campaign queries
 */
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  return prisma.campaign.findFirst({
    where: {
      slug,
      status: "active",
    },
  })
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  return prisma.campaign.findUnique({
    where: { id },
  })
}

export async function getCampaignsByUserId(userId: string): Promise<Campaign[]> {
  return prisma.campaign.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  })
}

export async function getActiveCampaigns(limit = 50): Promise<Campaign[]> {
  return prisma.campaign.findMany({
    where: { status: "active" },
    orderBy: { created_at: "desc" },
    take: limit,
  })
}

export async function createCampaign(data: {
  user_id: string
  slug: string
  title: string
  goal_amount: number
  description: string
  image_url?: string | null
  category: string
}): Promise<Campaign> {
  return prisma.campaign.create({
    data: {
      user_id: data.user_id,
      slug: data.slug,
      title: data.title,
      goal_amount: data.goal_amount,
      description: data.description,
      image_url: data.image_url || null,
      category: data.category,
    },
  })
}

export async function updateCampaignAmount(
  campaignId: string,
  amount: number
): Promise<void> {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      current_amount: {
        increment: amount,
      },
    },
  })
}

/**
 * Donation queries
 */
export async function createDonation(data: {
  campaign_id: string
  donor_name?: string | null
  donor_email?: string | null
  donor_phone?: string | null
  amount: number
  payment_method: "paystack" | "card"
  payment_id?: string | null
  ip_address?: string | null
}): Promise<Donation> {
  return prisma.donation.create({
    data: {
      campaign_id: data.campaign_id,
      donor_name: data.donor_name || null,
      donor_email: data.donor_email || null,
      donor_phone: data.donor_phone || null,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_id: data.payment_id || null,
      ip_address: data.ip_address || null,
    },
  })
}

export async function getDonationById(id: string): Promise<Donation | null> {
  return prisma.donation.findUnique({
    where: { id },
  })
}

export async function getDonationByPaymentId(paymentId: string): Promise<Donation | null> {
  return prisma.donation.findFirst({
    where: { payment_id: paymentId },
  })
}

export async function verifyDonation(id: string, paymentId: string): Promise<void> {
  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Update donation
    const donation = await tx.donation.update({
      where: { id },
      data: {
        verified: true,
        payment_id: paymentId,
      },
    })

    // Update campaign amount
    await tx.campaign.update({
      where: { id: donation.campaign_id },
      data: {
        current_amount: {
          increment: Number(donation.amount),
        },
      },
    })
  })
}

export async function getDonationsByCampaign(
  campaignId: string,
  limit = 50
): Promise<Donation[]> {
  return prisma.donation.findMany({
    where: {
      campaign_id: campaignId,
      verified: true,
    },
    orderBy: { created_at: "desc" },
    take: limit,
  })
}

/**
 * Audit log queries
 */
export async function createAuditLog(data: {
  user_id?: string | null
  campaign_id?: string | null
  action: "donation" | "campaign_created" | "campaign_updated" | "withdrawal_requested"
  details: any
  ip_address?: string | null
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      user_id: data.user_id || null,
      campaign_id: data.campaign_id || null,
      action: data.action,
      details: data.details,
      ip_address: data.ip_address || null,
    },
  })
}

/**
 * Withdrawal request queries
 */
export async function createWithdrawalRequest(data: {
  campaign_id: string
  user_id: string
  amount: number
  bank_account: string
  reason: string
}): Promise<WithdrawalRequest> {
  return prisma.withdrawalRequest.create({
    data: {
      campaign_id: data.campaign_id,
      user_id: data.user_id,
      amount: data.amount,
      bank_account: data.bank_account,
      reason: data.reason,
    },
  })
}
