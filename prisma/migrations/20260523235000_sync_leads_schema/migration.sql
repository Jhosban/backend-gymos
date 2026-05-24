-- Align leads table with current Prisma schema

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "fitnessGoal" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "conversionProbability" INTEGER NOT NULL DEFAULT 30;

UPDATE "leads"
SET "fitnessGoal" = COALESCE(
  "productDetails"->>'clientObjective',
  CASE COALESCE("productType", "serviceType")
    WHEN 'MEMBERSHIP' THEN 'Membresía ' || COALESCE("productDetails"->>'membershipType', 'general')
    WHEN 'PERSONAL_TRAINING' THEN 'Entrenamiento personal'
    WHEN 'FITNESS_PRODUCT' THEN COALESCE("productDetails"->>'productName', 'Producto fitness')
    ELSE 'Sin especificar'
  END
)
WHERE "fitnessGoal" IS NULL
  AND ("productDetails" IS NOT NULL OR "productType" IS NOT NULL OR "serviceType" IS NOT NULL);

UPDATE "leads"
SET "budget" = COALESCE(
  NULLIF("productDetails"->>'packagePrice', '')::DOUBLE PRECISION,
  NULLIF("productDetails"->>'pricePerPeriod', '')::DOUBLE PRECISION,
  NULLIF("productDetails"->>'unitPrice', '')::DOUBLE PRECISION
    * COALESCE(NULLIF("productDetails"->>'quantity', '')::DOUBLE PRECISION, 1),
  0
)
WHERE "budget" IS NULL
  AND "productDetails" IS NOT NULL;

UPDATE "leads" SET "fitnessGoal" = 'Sin especificar' WHERE "fitnessGoal" IS NULL;
UPDATE "leads" SET "budget" = 0 WHERE "budget" IS NULL;

ALTER TABLE "leads" ALTER COLUMN "fitnessGoal" SET NOT NULL;
ALTER TABLE "leads" ALTER COLUMN "budget" SET NOT NULL;

ALTER TABLE "leads" DROP COLUMN IF EXISTS "productDetails";
ALTER TABLE "leads" DROP COLUMN IF EXISTS "productType";
ALTER TABLE "leads" DROP COLUMN IF EXISTS "serviceType";
