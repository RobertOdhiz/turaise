import { NextRequest } from "next/server"

/**
 * Get the base URL from the request
 * Works for both server-side (API routes) and client-side
 */
export function getBaseUrl(request?: NextRequest | Request | null): string {
  // Server-side: Use request headers
  if (request) {
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || 
                     (request.url?.startsWith("https") ? "https" : "http")
    
    if (host) {
      return `${protocol}://${host}`
    }
  }

  // Client-side: Use window.location
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Fallback: Use environment variable
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.NEXTAUTH_URL || 
         "http://localhost:3000"
}

/**
 * Get the base URL for client components
 */
export function getClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.NEXTAUTH_URL || 
         "http://localhost:3000"
}

