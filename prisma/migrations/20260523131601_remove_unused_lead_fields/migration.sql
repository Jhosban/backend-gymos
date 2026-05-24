-- AlterTable
ALTER TABLE "leads" DROP COLUMN IF EXISTS "fitnessGoal",
DROP COLUMN IF EXISTS "budget",
DROP COLUMN IF EXISTS "conversionProbability",
DROP COLUMN IF EXISTS "serviceType";
