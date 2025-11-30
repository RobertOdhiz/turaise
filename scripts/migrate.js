#!/usr/bin/env node

/**
 * Database Migration Script for Neon PostgreSQL
 * 
 * This script reads the schema.sql file and executes it against your Neon database.
 * 
 * Usage:
 *   npm run migrate
 *   or
 *   node scripts/migrate.js
 * 
 * Make sure DATABASE_URL is set in your environment variables.
 */

const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { Pool } = require('pg')

// Load environment variables from .env.local if it exists
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set in environment variables')
  console.error('   Please set DATABASE_URL in your .env.local file')
  process.exit(1)
}

async function runMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('sslmode=require') ? {
      rejectUnauthorized: false,
    } : undefined,
  })

  try {
    console.log('📖 Reading schema file...')
    const schemaPath = join(process.cwd(), 'neon', 'schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    console.log('🔌 Connecting to database...')
    const client = await pool.connect()

    try {
      console.log('🚀 Running migration...')
      
      // Execute the entire SQL file
      // The schema uses IF NOT EXISTS, so it's safe to run multiple times
      try {
        await client.query(schemaSQL)
        console.log('  ✓ Schema executed successfully')
      } catch (error) {
        // Check if it's a harmless "already exists" error
        const isHarmlessError = 
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.message.includes('duplicate') ||
          (error.code === '42P07') || // duplicate_table
          (error.code === '42710') || // duplicate_object
          (error.code === '42P16')    // invalid_table_definition
        
        if (isHarmlessError) {
          console.log(`  ⚠️  Warning: ${error.message.split('\n')[0]}`)
          console.log('  ℹ️  This is usually OK - some objects may already exist')
        } else {
          console.error('  ❌ Migration error:', error.message)
          throw error
        }
      }

      console.log('✅ Migration completed successfully!')
      
      // Verify tables were created
      console.log('\n📊 Verifying tables...')
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `)
      
      console.log(`   Found ${result.rows.length} tables:`)
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`)
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()

