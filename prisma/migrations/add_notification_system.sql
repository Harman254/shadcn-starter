-- Add NotificationPreferences model
CREATE TABLE "NotificationPreferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
  "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
  "mealPlanReminders" BOOLEAN NOT NULL DEFAULT true,
  "pantryAlerts" BOOLEAN NOT NULL DEFAULT true,
  "expirationWarnings" BOOLEAN NOT NULL DEFAULT true,
  "completionCelebrations" BOOLEAN NOT NULL DEFAULT true,
  "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
  "proactiveSuggestions" BOOLEAN NOT NULL DEFAULT true,
  "preferredTime" TEXT,
  "timezone" TEXT,
  "quietHoursStart" TEXT,
  "quietHoursEnd" TEXT,
  "maxEmailsPerDay" INTEGER NOT NULL DEFAULT 3,
  "maxPushPerDay" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add NotificationLog model for analytics
CREATE TABLE "NotificationLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "clicked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add InAppNotification model for persistent notifications
CREATE TABLE "InAppNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "actionUrl" TEXT,
  "actionLabel" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InAppNotification_userId_idx" ON "InAppNotification"("userId");
CREATE INDEX "InAppNotification_read_idx" ON "InAppNotification"("read");

ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

