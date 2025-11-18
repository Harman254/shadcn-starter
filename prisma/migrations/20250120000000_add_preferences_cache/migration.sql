-- AlterTable
ALTER TABLE "OnboardingData" ADD COLUMN IF NOT EXISTS "preferencesSummary" TEXT,
ADD COLUMN IF NOT EXISTS "preferencesHash" TEXT;

