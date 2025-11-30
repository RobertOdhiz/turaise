-- Migration: Add 'paystack' to PaymentMethod enum and migrate existing data
-- 
-- This migration:
-- 1. Adds 'paystack' to the PaymentMethod enum
-- 2. Migrates any existing 'mpesa' donations to 'paystack'
-- 3. The 'mpesa' enum value will be removed by Prisma db push (after data migration)

-- Step 1: Add 'paystack' to PaymentMethod enum
-- Note: This must be run in a separate transaction/command
-- Run: ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'paystack';
-- (This is done via scripts/add-paystack-enum.sql)

-- Step 2: Migrate any existing donations from 'mpesa' to 'paystack'
-- Note: This must be run AFTER the enum value is added and committed
-- Run: UPDATE donations SET payment_method = 'paystack'::"PaymentMethod" WHERE payment_method = 'mpesa'::"PaymentMethod";
-- (This is done via scripts/migrate-mpesa-to-paystack.sql)

-- After running the above scripts, run: npx prisma db push --accept-data-loss
-- This will remove 'mpesa' from the enum (safe since all data has been migrated)

