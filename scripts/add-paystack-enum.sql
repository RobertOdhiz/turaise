-- Step 1: Add 'paystack' to PaymentMethod enum
-- This must be run in a separate transaction
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'paystack';

