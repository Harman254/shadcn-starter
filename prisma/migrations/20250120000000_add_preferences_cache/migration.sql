-- AlterTable (with existence check)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'OnboardingData') THEN
        ALTER TABLE "OnboardingData" ADD COLUMN IF NOT EXISTS "preferencesSummary" TEXT;
        ALTER TABLE "OnboardingData" ADD COLUMN IF NOT EXISTS "preferencesHash" TEXT;
    END IF;
END $$;

