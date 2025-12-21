# 🚀 Inngest Quick Start Guide

## Setup Steps

### 1. Install Dependencies (Already Done ✅)
```bash
npm install inngest
```

### 2. Add Environment Variables
Add to your `.env`:
```env
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

### 3. Run Database Migration
```bash
npx prisma migrate dev --name add_notification_system
```

### 4. Update Prisma Schema
Add these models to `prisma/schema.prisma`:
```prisma
model NotificationPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  emailEnabled          Boolean  @default(true)
  pushEnabled           Boolean  @default(true)
  inAppEnabled          Boolean  @default(true)
  mealPlanReminders     Boolean  @default(true)
  pantryAlerts          Boolean  @default(true)
  expirationWarnings    Boolean  @default(true)
  completionCelebrations Boolean @default(true)
  weeklyDigest         Boolean  @default(true)
  proactiveSuggestions Boolean  @default(true)
  preferredTime         String?
  timezone              String?
  quietHoursStart       String?
  quietHoursEnd         String?
  maxEmailsPerDay       Int      @default(3)
  maxPushPerDay         Int      @default(5)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  user                  User     @relation(fields: [userId], references: [id])
}

model NotificationLog {
  id        String   @id @default(cuid())
  userId    String
  type      String
  channel   String
  read      Boolean  @default(false)
  clicked   Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([createdAt])
}

model InAppNotification {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  message     String
  actionUrl   String?
  actionLabel String?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([read])
}
```

### 5. Register Inngest Functions
The functions are already set up in:
- `lib/inngest/client.ts` - Inngest client
- `app/api/inngest/route.ts` - API endpoint
- `lib/inngest/functions/` - All functions

### 6. Test Locally
```bash
# Install Inngest Dev Server
npx inngest-cli@latest dev

# In another terminal, run your app
npm run dev
```

### 7. Deploy to Production
1. Sign up at [inngest.com](https://www.inngest.com)
2. Create a new app
3. Get your event key and signing key
4. Add to production environment variables
5. Deploy your Next.js app

## Testing Workflows

### Test Weekly Reminder
```bash
# Trigger manually via Inngest dashboard or API
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "inngest/function.triggered",
    "data": {
      "function_id": "weekly-meal-plan-reminder"
    }
  }'
```

### Test Event-Driven Function
```typescript
// In your code, trigger the event:
import { inngest } from "@/lib/inngest/client";

await inngest.send({
  name: "meal-plan.completed",
  data: {
    userId: "user_123",
    mealPlanId: "plan_456",
  },
});
```

## Next Steps

1. **Complete Implementation**
   - Finish all TODO functions in `lib/inngest/functions/`
   - Add email templates
   - Add push notification integration
   - Create in-app notification UI

2. **Add User Preferences UI**
   - Create settings page
   - Add notification preference toggles
   - Add timezone selector

3. **Monitor & Optimize**
   - Track notification open rates
   - A/B test messaging
   - Optimize send times
   - Adjust frequency limits

## Resources

- [Inngest Docs](https://www.inngest.com/docs)
- [Inngest Next.js Guide](https://www.inngest.com/docs/quick-start/nextjs)
- [Inngest Dashboard](https://app.inngest.com)

