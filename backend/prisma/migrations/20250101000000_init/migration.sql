-- CreateEnum
CREATE TYPE "TipStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "Creator" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "subscriptionTiers" JSONB NOT NULL DEFAULT '[]',
    "totalTipsReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSubscribers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" SERIAL NOT NULL,
    "fromWallet" TEXT NOT NULL,
    "toCreatorWallet" TEXT NOT NULL,
    "amountUSDC" DOUBLE PRECISION NOT NULL,
    "transactionSignature" TEXT NOT NULL,
    "message" TEXT,
    "status" "TipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "fanWallet" TEXT NOT NULL,
    "creatorWallet" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "priceUSDC" DOUBLE PRECISION NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextPaymentDate" TIMESTAMP(3) NOT NULL,
    "lastPaymentDate" TIMESTAMP(3),
    "lastTransactionSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_walletAddress_key" ON "Creator"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tip_transactionSignature_key" ON "Tip"("transactionSignature");

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_toCreatorWallet_fkey" FOREIGN KEY ("toCreatorWallet") REFERENCES "Creator"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_creatorWallet_fkey" FOREIGN KEY ("creatorWallet") REFERENCES "Creator"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
