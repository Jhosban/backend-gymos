/*
  Warnings:

  - A unique constraint covering the columns `[biometricCredentialId]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "productDetails" JSONB,
ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'FITNESS_PRODUCT',
ADD COLUMN     "serviceType" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "biometricCredentialId" TEXT;

-- CreateIndex
CREATE INDEX "leads_productType_idx" ON "leads"("productType");

-- CreateIndex
CREATE UNIQUE INDEX "members_biometricCredentialId_key" ON "members"("biometricCredentialId");
