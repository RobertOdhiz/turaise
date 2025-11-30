// Server-only module - pg is a Node.js native module
import "server-only"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Create PostgreSQL connection pool for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=require") ? {
    rejectUnauthorized: false,
  } : undefined,
})

// Export pool for direct queries
export { pool }

/**
 * Execute a raw SQL query
 */
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(queryText, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

/**
 * Execute a query and return a single row or null
 */
export async function queryOne<T = any>(
  queryText: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(queryText, params)
  return rows[0] || null
}


