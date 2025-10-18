-- Remove subscription-related columns and tables
-- Drop foreign key constraints first
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_creatorWallet_fkey";

-- Drop the Subscription table
DROP TABLE IF EXISTS "Subscription";

-- Drop the SubscriptionStatus enum
DROP TYPE IF EXISTS "SubscriptionStatus";

-- Remove subscription-related columns from Creator table
ALTER TABLE "Creator" DROP COLUMN IF EXISTS "subscriptionTiers";
ALTER TABLE "Creator" DROP COLUMN IF EXISTS "totalSubscribers";
