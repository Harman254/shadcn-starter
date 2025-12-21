# 🚀 Inngest & Notifications Integration Strategy

**Date:** January 2025  
**Goal:** Build a world-class notification system that drives engagement, retention, and conversions

---

## 📋 Table of Contents

1. [Why Inngest?](#why-inngest)
2. [Notification Architecture](#notification-architecture)
3. [Workflow Mapping](#workflow-mapping)
4. [Implementation Plan](#implementation-plan)
5. [User Experience Design](#user-experience-design)
6. [Benefits & ROI](#benefits--roi)

---

## 🎯 Why Inngest?

### Current State
- ✅ Basic PushEngage integration (push notifications)
- ✅ Resend email integration (transactional emails)
- ✅ Manual notification triggers (API calls)
- ❌ No scheduled workflows
- ❌ No background job processing
- ❌ No retry logic for failed notifications
- ❌ No user preference management

### What Inngest Solves

1. **Reliable Background Jobs**
   - Scheduled workflows (daily/weekly meal plan reminders)
   - Retry logic for failed operations
   - Event-driven architecture
   - No serverless timeout issues

2. **Complex Workflows**
   - Multi-step processes (generate meal plan → send notification → track analytics)
   - Conditional logic (only notify if user hasn't logged in)
   - Parallel operations (send email + push notification simultaneously)

3. **Developer Experience**
   - Type-safe functions
   - Visual workflow debugging
   - Built-in retry and error handling
   - Easy testing

4. **Cost Efficiency**
   - Pay only for what you use
   - No need to run cron jobs
   - Automatic scaling

---

## 🏗️ Notification Architecture

### Three-Layer System

```
┌─────────────────────────────────────────┐
│         User Preferences Layer          │
│  (Email, Push, In-App, Frequency)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Inngest Workflow Layer          │
│  (Scheduled, Event-Driven, Conditional) │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Delivery Layer                  │
│  (Resend, PushEngage, In-App, SMS)     │
└─────────────────────────────────────────┘
```

### Notification Channels

1. **Email** (Resend) - Transactional & Marketing
2. **Push Notifications** (PushEngage) - Real-time alerts
3. **In-App Notifications** (Database + UI) - Persistent
4. **SMS** (Future - Twilio) - Critical alerts only

---

## 🗺️ Workflow Mapping

### 1. Weekly Meal Plan Reminder

**Trigger:** Every Sunday at 9 AM (user's timezone)

**Workflow:**
```
1. Check user preferences
   ├─ Has meal plan reminder enabled? → Continue
   └─ No → Skip

2. Check last activity
   ├─ Last meal plan created < 7 days ago? → Skip (too recent)
   └─ Last meal plan created > 7 days ago? → Continue

3. Generate personalized message
   ├─ Use user's preferences (dietary, goals)
   ├─ Reference last meal plan (if exists)
   └─ Include upgrade CTA (if free user)

4. Send notifications
   ├─ Email (if enabled)
   ├─ Push notification (if enabled)
   └─ In-app notification (always)

5. Track analytics
   └─ Log notification sent, opened, clicked
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "weekly-meal-plan-reminder" },
  { cron: "0 9 * * 0" }, // Every Sunday 9 AM
  async ({ event, step }) => {
    // Get all active users
    const users = await step.run("get-active-users", async () => {
      return await prisma.user.findMany({
        where: { emailVerified: true },
        include: { Subscription: true }
      });
    });

    // Process each user
    await step.run("send-reminders", async () => {
      return Promise.all(
        users.map(user => sendMealPlanReminder(user))
      );
    });
  }
);
```

---

### 2. Pro Plan Expiration Warning

**Trigger:** 7 days before subscription expires

**Workflow:**
```
1. Query expiring subscriptions
   └─ currentPeriodEnd BETWEEN now AND now + 7 days

2. For each user:
   ├─ Check if already notified → Skip if notified < 3 days ago
   ├─ Generate personalized message
   │  ├─ Days remaining
   │  ├─ Benefits they'll lose
   │  └─ Special retention offer (if applicable)
   ├─ Send email (high priority)
   ├─ Send push notification
   └─ Track in database (prevent spam)
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "pro-plan-expiration-warning" },
  { cron: "0 10 * * *" }, // Daily at 10 AM
  async ({ event, step }) => {
    const expiringUsers = await step.run("get-expiring-users", async () => {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      return await prisma.subscription.findMany({
        where: {
          plan: { in: ["pro", "enterprise"] },
          status: "active",
          currentPeriodEnd: {
            lte: sevenDaysFromNow,
            gte: new Date()
          }
        },
        include: { user: true }
      });
    });

    await step.run("send-warnings", async () => {
      return Promise.all(
        expiringUsers.map(sub => sendExpirationWarning(sub))
      );
    });
  }
);
```

---

### 3. Pantry Expiration Alerts

**Trigger:** Daily at 8 AM (user's timezone)

**Workflow:**
```
1. Get user's pantry items
   └─ expiry BETWEEN now AND now + 3 days

2. For each expiring item:
   ├─ Check notification preferences
   ├─ Generate meal suggestions using expiring items
   ├─ Send notification with:
   │  ├─ List of expiring items
   │  ├─ Meal suggestions
   │  └─ "Add to Meal Plan" button
   └─ Track engagement
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "pantry-expiration-alert" },
  { cron: "0 8 * * *" }, // Daily at 8 AM
  async ({ event, step }) => {
    const usersWithExpiringItems = await step.run(
      "get-users-with-expiring-items",
      async () => {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        return await prisma.pantryItem.findMany({
          where: {
            expiry: {
              lte: threeDaysFromNow,
              gte: new Date()
            }
          },
          include: { user: true },
          distinct: ["userId"]
        });
      }
    );

    await step.run("send-alerts", async () => {
      return Promise.all(
        usersWithExpiringItems.map(item => 
          sendPantryExpirationAlert(item.user)
        )
      );
    });
  }
);
```

---

### 4. Usage Limit Reset Notification

**Trigger:** Weekly (Monday at 9 AM) for free users

**Workflow:**
```
1. Get free users who hit limits last week
   └─ Check ToolUsage for users who hit limits

2. Send "Your limits have reset!" notification
   ├─ Show what they can do now
   ├─ Highlight Pro benefits (subtle)
   └─ Encourage engagement
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "usage-limit-reset-notification" },
  { cron: "0 9 * * 1" }, // Every Monday 9 AM
  async ({ event, step }) => {
    const freeUsers = await step.run("get-free-users", async () => {
      return await prisma.subscription.findMany({
        where: { plan: "free", status: "active" },
        include: { user: true }
      });
    });

    await step.run("send-reset-notifications", async () => {
      return Promise.all(
        freeUsers.map(sub => sendLimitResetNotification(sub.user))
      );
    });
  }
);
```

---

### 5. Meal Plan Completion Celebration

**Trigger:** When user completes a meal plan (event-driven)

**Workflow:**
```
1. User marks all meals in a plan as "completed"
   └─ Event: meal-plan.completed

2. Calculate completion stats
   ├─ Days completed
   ├─ Meals cooked
   ├─ Calories tracked
   └─ Streak maintained

3. Send celebration notification
   ├─ Congratulatory message
   ├─ Stats visualization
   ├─ Next meal plan suggestion
   └─ Share on social (optional)
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "meal-plan-completion-celebration" },
  { event: "meal-plan.completed" },
  async ({ event, step }) => {
    const { userId, mealPlanId } = event.data;
    
    const stats = await step.run("calculate-stats", async () => {
      // Calculate completion statistics
      return calculateCompletionStats(userId, mealPlanId);
    });

    await step.run("send-celebration", async () => {
      return sendCompletionCelebration(userId, stats);
    });
  }
);
```

---

### 6. Abandoned Cart / Incomplete Meal Plan

**Trigger:** 24 hours after user starts but doesn't save meal plan

**Workflow:**
```
1. Detect incomplete meal plans
   └─ Created > 24 hours ago, not saved

2. Send reminder
   ├─ "Don't lose your meal plan!"
   ├─ Preview of what they created
   ├─ "Save Now" button
   └─ Offer to regenerate if expired
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "incomplete-meal-plan-reminder" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ event, step }) => {
    const incompletePlans = await step.run(
      "get-incomplete-plans",
      async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Get meal plans in conversation context but not saved
        return await prisma.conversationContext.findMany({
          where: {
            mealPlanId: { not: null },
            createdAt: { lt: yesterday }
          },
          include: { /* user data */ }
        });
      }
    );

    await step.run("send-reminders", async () => {
      return Promise.all(
        incompletePlans.map(ctx => 
          sendIncompletePlanReminder(ctx)
        )
      );
    });
  }
);
```

---

### 7. Proactive Meal Suggestions

**Trigger:** Daily at 6 PM (dinner time reminder)

**Workflow:**
```
1. Check user's meal plan for today
   ├─ Has dinner planned? → Skip
   └─ No dinner? → Continue

2. Generate suggestions based on:
   ├─ Pantry items
   ├─ Dietary preferences
   ├─ Recent meals (avoid repetition)
   └─ Time available (quick vs elaborate)

3. Send notification
   ├─ "Need dinner ideas?"
   ├─ 3-5 meal suggestions
   └─ "Add to Plan" buttons
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "proactive-meal-suggestions" },
  { cron: "0 18 * * *" }, // Daily at 6 PM
  async ({ event, step }) => {
    const usersNeedingSuggestions = await step.run(
      "get-users-needing-suggestions",
      async () => {
        // Logic to find users without dinner plans
        return getUsersWithoutDinnerPlans();
      }
    );

    await step.run("send-suggestions", async () => {
      return Promise.all(
        usersNeedingSuggestions.map(user => 
          sendProactiveMealSuggestions(user)
        )
      );
    });
  }
);
```

---

### 8. Weekly Digest Email

**Trigger:** Every Sunday at 10 AM

**Workflow:**
```
1. Aggregate weekly activity
   ├─ Meal plans created
   ├─ Recipes tried
   ├─ Grocery lists generated
   ├─ Calories tracked
   └─ Achievements unlocked

2. Generate personalized digest
   ├─ Visual stats
   ├─ Top recipes
   ├─ Nutrition insights
   └─ Next week preview

3. Send email
   └─ Beautiful HTML template
```

**Inngest Function:**
```typescript
inngest.createFunction(
  { id: "weekly-digest-email" },
  { cron: "0 10 * * 0" }, // Every Sunday 10 AM
  async ({ event, step }) => {
    const activeUsers = await step.run("get-active-users", async () => {
      return await getActiveUsersThisWeek();
    });

    await step.run("send-digests", async () => {
      return Promise.all(
        activeUsers.map(user => sendWeeklyDigest(user))
      );
    });
  }
);
```

---

## 🎨 User Experience Design

### Notification Preferences Model

```typescript
// Add to Prisma schema
model NotificationPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  emailEnabled          Boolean  @default(true)
  pushEnabled           Boolean  @default(true)
  inAppEnabled          Boolean  @default(true)
  
  // Frequency preferences
  mealPlanReminders     Boolean  @default(true)
  pantryAlerts          Boolean  @default(true)
  expirationWarnings    Boolean  @default(true)
  completionCelebrations Boolean @default(true)
  weeklyDigest         Boolean  @default(true)
  proactiveSuggestions Boolean  @default(true)
  
  // Timing preferences
  preferredTime         String?  // "09:00" format
  timezone              String?  // "America/New_York"
  quietHoursStart       String?  // "22:00"
  quietHoursEnd         String?  // "08:00"
  
  // Frequency limits
  maxEmailsPerDay       Int      @default(3)
  maxPushPerDay         Int      @default(5)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  user                  User     @relation(fields: [userId], references: [id])
}
```

### In-App Notification Component

```typescript
// components/notifications/notification-center.tsx
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'upgrade';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  read: boolean;
  createdAt: Date;
}
```

### Notification UI States

1. **Unread Badge** - Red dot on notification icon
2. **Toast Notifications** - Real-time alerts (non-intrusive)
3. **Notification Center** - Persistent list with filters
4. **Email Digest** - Weekly summary (opt-in)

---

## 💰 Benefits & ROI

### User Engagement

**Before:**
- Users forget to use the app
- No reminders to create meal plans
- Low retention (users churn after first use)

**After:**
- Weekly reminders drive regular usage
- Proactive suggestions increase engagement
- Completion celebrations build habits
- **Expected: 30-50% increase in DAU**

### Conversion to Pro

**Before:**
- Users hit limits, get frustrated, leave
- No follow-up on limit resets

**After:**
- Friendly limit notifications with upgrade path
- Reset notifications remind users of value
- Expiration warnings reduce churn
- **Expected: 15-25% increase in conversion rate**

### Retention

**Before:**
- Users create one meal plan, never return
- No re-engagement strategy

**After:**
- Weekly digests keep users engaged
- Proactive suggestions bring users back
- Completion celebrations create positive feedback loops
- **Expected: 20-40% reduction in churn**

### Cost Efficiency

**Inngest Pricing:**
- Free tier: 25,000 function runs/month
- Paid: $20/month for 100,000 runs
- **Cost per notification: ~$0.0002**

**ROI Calculation:**
- 10,000 users × 4 notifications/week = 40,000 notifications/month
- Cost: ~$8/month
- If 1% convert to Pro ($9.99/month) = $99.90/month
- **ROI: 1,248%**

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1-2)

1. **Setup Inngest**
   ```bash
   npm install inngest
   ```

2. **Create Inngest API Route**
   ```typescript
   // app/api/inngest/route.ts
   import { serve } from "inngest/next";
   import { inngest } from "@/lib/inngest/client";
   import * as functions from "@/lib/inngest/functions";

   export const { GET, POST, PUT } = serve({
     client: inngest,
     functions: Object.values(functions),
   });
   ```

3. **Add Notification Preferences to Schema**
   ```bash
   npx prisma migrate dev --name add_notification_preferences
   ```

4. **Create Notification Preferences UI**
   - Settings page component
   - Preference toggles
   - Timezone selector

### Phase 2: Core Workflows (Week 3-4)

1. **Weekly Meal Plan Reminder**
   - Inngest function
   - Email template
   - Push notification

2. **Usage Limit Reset**
   - Inngest function
   - Notification template

3. **Pro Plan Expiration Warning**
   - Inngest function
   - Retention email template

### Phase 3: Advanced Features (Week 5-6)

1. **Pantry Expiration Alerts**
   - Inngest function
   - Meal suggestion integration

2. **Proactive Meal Suggestions**
   - Inngest function
   - AI integration for suggestions

3. **Weekly Digest**
   - Inngest function
   - Beautiful email template

### Phase 4: Polish & Optimization (Week 7-8)

1. **A/B Testing**
   - Test different notification copy
   - Optimize send times
   - Test frequency limits

2. **Analytics Integration**
   - Track open rates
   - Track click rates
   - Track conversion rates

3. **User Feedback**
   - "Was this helpful?" buttons
   - Preference adjustments based on feedback

---

## 📊 Success Metrics

### Key Performance Indicators

1. **Engagement Metrics**
   - DAU increase: Target +30%
   - Weekly active users: Target +40%
   - Session frequency: Target +25%

2. **Conversion Metrics**
   - Free → Pro conversion: Target +20%
   - Notification click-through rate: Target >15%
   - Email open rate: Target >25%

3. **Retention Metrics**
   - 7-day retention: Target +15%
   - 30-day retention: Target +20%
   - Churn rate: Target -25%

4. **User Satisfaction**
   - Notification preference adoption: Target >60%
   - Unsubscribe rate: Target <2%
   - User feedback score: Target >4/5

---

## 🎯 Next Steps

1. **Review this strategy** with your team
2. **Prioritize workflows** based on impact
3. **Start with Phase 1** (foundation)
4. **Iterate based on data** (A/B test everything)
5. **Scale gradually** (don't overwhelm users)

---

## 📝 Notes

- **Respect user preferences** - Always check before sending
- **Don't spam** - Limit frequency, respect quiet hours
- **Make it valuable** - Every notification should provide value
- **Test everything** - A/B test copy, timing, frequency
- **Monitor closely** - Track metrics, adjust based on data

**This system will transform MealWise from a tool users forget about into a daily companion that helps them achieve their goals! 🚀**

