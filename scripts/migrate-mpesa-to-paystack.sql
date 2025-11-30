-- Step 2: Migrate any existing donations from 'mpesa' to 'paystack'
-- Run this AFTER the enum value has been added and committed
UPDATE donations 
SET payment_method = 'paystack'::"PaymentMethod"
WHERE payment_method = 'mpesa'::"PaymentMethod";

