// Server-only module
import "server-only"
import bcrypt from "bcryptjs"
import { getAuthUserByEmail } from "./db/queries"

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Get auth user by email (re-exported from queries for convenience)
 */
export { getAuthUserByEmail } from "./db/queries"
