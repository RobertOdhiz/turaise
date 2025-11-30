import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in Kenyan Shillings
 * Uses fixed locale to ensure consistent formatting on server and client
 */
export function formatCurrency(amount: number): string {
  // Use fixed locale to prevent hydration mismatches
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format phone number (remove +, spaces, etc.)
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Validate Kenyan phone number format
 */
export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = formatPhoneNumber(phone)
  // Kenyan phone: 254XXXXXXXXX (11 digits starting with 254)
  return /^254\d{9}$/.test(cleaned)
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}

/**
 * Sanitize HTML content
 */
export async function sanitizeHtml(html: string): Promise<string> {
  if (typeof window === "undefined") {
    const DOMPurify = await import("isomorphic-dompurify")
    return DOMPurify.default.sanitize(html)
  }
  const DOMPurify = (await import("dompurify")).default
  return DOMPurify.sanitize(html)
}

/**
 * Format date consistently (prevents hydration mismatches)
 * Uses a consistent format that works the same on server and client
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  // Use a consistent format that doesn't depend on locale
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Format date in a readable format (e.g., "Jan 12, 2025")
 * Uses date-fns for consistent formatting
 */
export function formatDateReadable(date: Date | string): string {
  const { format } = require("date-fns")
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMM d, yyyy")
}

