# Pro Plan Design & Implementation Guide

## 📋 Overview

This document outlines the complete design and implementation strategy for the MealWise Pro Plan system. The system is already integrated with **Polar** for subscription management, and we have a robust `useProFeatures()` hook in place.

---

## 🏗️ System Architecture

### Current Infrastructure

#### ✅ Already Implemented
1. **Polar Integration** (`lib/auth.ts`)
   - Checkout flow configured
   - Portal for subscription management
   - Usage tracking
   - Webhook handlers
   - Product ID: `d6f79514-fa26-4b48-a8f4-da20e3d087c5`
   - Slug: `Mealwise-Pro`

2. **Subscription Hook** (`hooks/use-pro-features.ts`)
   - `useProFeatures()` - Main hook for feature access
   - `useNutritionAnalytics()` - Convenience hook for analytics
   - `useUnlimitedMealPlans()` - Convenience hook for meal plans
   - Feature definitions in `PRO_FEATURES` object
   - Subscription state management
   - Upgrade modal integration

3. **Subscription API** (`app/api/subscription/route.ts`)
   - GET: Fetch user subscription
   - POST: Create/update subscription
   - PATCH: Update subscription fields
   - Database integration via `data/index.ts`

4. **Subscription Modal** (`components/SubscriptionModal.tsx`)
   - Upgrade flow UI
   - Plan comparison
   - Polar checkout integration

5. **Database Schema** (`prisma/schema.prisma`)
   - `Subscription` table with plan, status, features
   - `MealSwapCount` table for free user limits

---

## 🎨 Pro Plan Design System

### Visual Design Language

#### Pro Badges & Indicators

```typescript
// Pro Badge Component
<Badge variant="pro" className="bg-gradient-to-r from-amber-500 to-orange-500">
  <Crown className="w-3 h-3 mr-1" />
  Pro
</Badge>

// Locked Feature Badge
<Badge variant="locked" className="bg-muted text-muted-foreground">
  <Lock className="w-3 h-3 mr-1" />
  Pro Feature
</Badge>
```

#### Color Palette
- **Pro Accent**: `from-amber-500 to-orange-500` (gradient)
- **Locked State**: `bg-muted/50` with blur effect
- **Upgrade CTA**: `bg-gradient-to-r from-blue-600 to-indigo-700`
- **Pro Indicator**: Gold/Amber tones

#### Typography
- **Pro Label**: `text-xs font-semibold tracking-wide uppercase`
- **Feature Name**: `text-lg font-bold`
- **Description**: `text-sm text-muted-foreground`

---

## 🔒 Feature Gating Strategy

### Two-Layer Protection

#### 1. Server-Side (Primary)
All critical checks happen server-side to prevent bypassing.

```typescript
// Server Component Pattern
async function ProtectedFeaturePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const subscription = await getSubscriptionByUserId(session.user.id);
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  
  if (!isPro) {
    return <FeatureLockedView featureId="nutrition-analytics" />;
  }
  
  return <FeatureContent />;
}
```

#### 2. Client-Side (UX)
Client-side checks for immediate UI feedback and upgrade prompts.

```typescript
// Client Component Pattern
'use client'
function FeatureComponent() {
  const { isPro, hasFeature, requestUpgradeModal } = useProFeatures();
  const feature = PRO_FEATURES["nutrition-analytics"];
  
  if (!hasFeature("nutrition-analytics")) {
    return (
      <FeatureLockedCard 
        feature={feature}
        onUpgrade={() => requestUpgradeModal(feature)}
      />
    );
  }
  
  return <FeatureContent />;
}
```

---

## 📊 Pro Features Catalog

### Current Pro Features

| Feature ID | Name | Category | Required Plan |
|------------|------|----------|---------------|
| `nutrition-analytics` | Nutrition Analytics | Analytics | Pro |
| `unlimited-meal-plans` | Unlimited Meal Plans | Meal Planning | Pro |
| `unlimited-meal-swaps` | Unlimited Meal Swaps | Meal Planning | Pro |
| `unlimited-favorites` | Unlimited Favorites | Recipes | Pro |
| `advanced-meal-customization` | Advanced Customization | Meal Planning | Pro |
| `meal-plan-templates` | Premium Templates | Meal Planning | Pro |
| `recipe-import` | Recipe Import | Recipes | Pro |
| `priority-support` | Priority Support | Premium | Pro |
| `advanced-export` | Advanced Export | Premium | Pro |

### Feature Implementation Status

- ✅ **Defined**: Feature exists in `PRO_FEATURES`
- 🔄 **Partially Implemented**: Some gating exists but needs completion
- ❌ **Not Implemented**: Feature defined but no gating yet

| Feature | Status | Implementation Location |
|---------|--------|------------------------|
| `nutrition-analytics` | 🔄 | Analytics page needs gating |
| `unlimited-meal-plans` | 🔄 | Needs verification |
| `unlimited-meal-swaps` | 🔄 | Swap limits exist, Pro check needs verification |
| `unlimited-favorites` | ❌ | No gating implemented |
| `advanced-meal-customization` | ❌ | No gating implemented |
| `meal-plan-templates` | ❌ | No gating implemented |
| `recipe-import` | ❌ | No gating implemented |
| `priority-support` | ❌ | No gating implemented |
| `advanced-export` | ❌ | No gating implemented |

---

## 🎯 Priority Implementation: Analytics Page

### Design Mockup

#### Locked State (Free Users)

```
┌─────────────────────────────────────────────────┐
│  [Back]  Analytics Dashboard          [🔒 Pro] │
├─────────────────────────────────────────────────┤
│                                                 │
│           ┌─────────────────┐                  │
│           │   🔒 Lock Icon   │                  │
│           └─────────────────┘                  │
│                                                 │
│         Nutrition Analytics                    │
│         Pro Feature                             │
│                                                 │
│  Get detailed nutrition tracking and analytics │
│  with your Pro subscription.                    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  [Blurred Preview of Analytics Charts]  │   │
│  │  (Glassmorphism overlay with lock)      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│         ┌──────────────────────┐               │
│         │  Upgrade to Pro  $5/mo│               │
│         └──────────────────────┘               │
│                                                 │
│  What you'll get:                               │
│  ✓ Detailed nutrition breakdown                 │
│  ✓ Calorie tracking over time                  │
│  ✓ Macro and micronutrient insights            │
│  ✓ Meal plan progress tracking                 │
│  ✓ Grocery shopping insights                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Unlocked State (Pro Users)

```
┌─────────────────────────────────────────────────┐
│  [Back]  Analytics Dashboard  [👑 Pro Badge]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Meal     │ │ Grocery  │       │
│  │ Meals    │ │ Plans    │ │ Items    │       │
│  │   42     │ │   8      │ │   156    │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  [Calorie Chart]    [Nutrition Donut]          │
│                                                 │
│  [Recent Meals]  [Meal Plan Progress]          │
│                                                 │
│  [Grocery Insights]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementation Components

#### 1. AnalyticsLockedView Component

**File**: `app/(dashboard)/dashboard/analytics/AnalyticsLockedView.tsx`

```typescript
'use client'

import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features"
import { Lock, Crown, TrendingUp, BarChart3, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SubscriptionModal from "@/components/SubscriptionModal"

export function AnalyticsLockedView() {
  const { requestUpgradeModal, upgradeModalFeature, setUpgradeModalFeature } = useProFeatures()
  const feature = PRO_FEATURES["nutrition-analytics"]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
            <Lock className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Nutrition Analytics</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Crown className="h-4 w-4" />
            <span className="text-sm font-semibold">Pro Feature</span>
          </div>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {feature.description}
          </p>
        </div>
        
        {/* Blurred Preview */}
        <Card className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Upgrade to Pro to unlock</p>
            </div>
          </div>
          <CardContent className="p-6 opacity-30 blur-sm">
            {/* Preview of analytics charts (blurred) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
            </div>
            <div className="h-48 bg-muted rounded-lg" />
          </CardContent>
        </Card>
        
        {/* Features List */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">What you'll get with Pro:</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: BarChart3, text: "Detailed nutrition breakdown" },
                { icon: TrendingUp, text: "Calorie tracking over time" },
                { icon: Target, text: "Macro and micronutrient insights" },
                { icon: Crown, text: "Meal plan progress tracking" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => requestUpgradeModal(feature)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-8 py-6 text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro - $5/month
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Cancel anytime. 7-day money-back guarantee.
          </p>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <SubscriptionModal
        featureId="nutrition-analytics"
        open={upgradeModalFeature?.id === "nutrition-analytics"}
        onOpenChange={(open) => !open && setUpgradeModalFeature(null)}
      />
    </div>
  )
}
```

#### 2. Updated Analytics Page with Gating

**File**: `app/(dashboard)/dashboard/analytics/page.tsx`

```typescript
import { AnalyticsHeader } from "./AnalyticsHeader"
import { AnalyticsContent } from "./AnalyticsContent"
import { AnalyticsLockedView } from "./AnalyticsLockedView"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSubscriptionByUserId } from '@/data'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 60

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    </div>
  )
}

async function AnalyticsPageContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Check subscription status
  const subscription = await getSubscriptionByUserId(session.user.id)
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise'
  const hasAnalytics = subscription?.features?.includes('nutrition-analytics') || isPro

  // If not Pro, show locked view
  if (!hasAnalytics) {
    return <AnalyticsLockedView />
  }

  // Pro users see full analytics
  return <AnalyticsContent userId={session.user.id} />
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalyticsPageContent />
    </Suspense>
  )
}
```

---

## 🎨 UI Component Library

### Pro Feature Components

#### 1. FeatureLockedCard

```typescript
'use client'

interface FeatureLockedCardProps {
  feature: ProFeature
  preview?: React.ReactNode
  onUpgrade: () => void
}

export function FeatureLockedCard({ feature, preview, onUpgrade }: FeatureLockedCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
        <Lock className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <Badge variant="locked" className="mb-3">
          <Crown className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>
        <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {feature.description}
        </p>
        <Button onClick={onUpgrade} size="sm">
          Upgrade to Pro
        </Button>
      </div>
      
      {/* Blurred preview */}
      <div className="opacity-30 blur-sm pointer-events-none">
        {preview}
      </div>
    </Card>
  )
}
```

#### 2. ProBadge

```typescript
export function ProBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="pro" 
      className={cn(
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
        className
      )}
    >
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  )
}
```

#### 3. FeatureGate Wrapper

```typescript
'use client'

interface FeatureGateProps {
  featureId: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ featureId, children, fallback }: FeatureGateProps) {
  const { hasFeature, requestUpgradeModal } = useProFeatures()
  const feature = PRO_FEATURES[featureId]
  
  if (!hasFeature(featureId)) {
    return fallback || (
      <FeatureLockedCard 
        feature={feature}
        onUpgrade={() => requestUpgradeModal(feature)}
      />
    )
  }
  
  return <>{children}</>
}
```

---

## 🔄 Server-Side Utilities

### Subscription Check Utility

**File**: `lib/utils/subscription.ts` (NEW)

```typescript
import { getSubscriptionByUserId } from "@/data"

export interface SubscriptionStatus {
  isPro: boolean
  isEnterprise: boolean
  plan: "free" | "pro" | "enterprise"
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
  features: string[]
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const subscription = await getSubscriptionByUserId(userId)
  
  if (!subscription) {
    return {
      isPro: false,
      isEnterprise: false,
      plan: "free",
      status: "active",
      features: []
    }
  }
  
  const isPro = subscription.plan === "pro" || subscription.plan === "enterprise"
  const isEnterprise = subscription.plan === "enterprise"
  
  return {
    isPro,
    isEnterprise,
    plan: subscription.plan as "free" | "pro" | "enterprise",
    status: subscription.status as SubscriptionStatus["status"],
    features: subscription.features || []
  }
}

export async function hasProFeature(
  userId: string, 
  featureId: string
): Promise<boolean> {
  const status = await checkSubscriptionStatus(userId)
  
  // Pro/Enterprise users have access to all pro features
  if (status.isPro) {
    return true
  }
  
  // Check if feature is in user's feature list
  return status.features.includes(featureId)
}

export async function isProUser(userId: string): Promise<boolean> {
  const status = await checkSubscriptionStatus(userId)
  return status.isPro
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Day 1)
- [x] ✅ Polar integration (already done)
- [x] ✅ Subscription hook (already done)
- [ ] Create `lib/utils/subscription.ts` utility
- [ ] Test subscription API endpoints
- [ ] Verify Pro feature definitions

### Phase 2: Analytics Page Gating (Day 1-2)
- [ ] Create `AnalyticsLockedView` component
- [ ] Update analytics page with server-side gating
- [ ] Add Pro badge to analytics header (when unlocked)
- [ ] Update navigation with lock indicator
- [ ] Test upgrade flow from analytics page

### Phase 3: Meal Swap Enhancement (Day 2-3)
- [ ] Verify Pro check in `meal-actions.tsx`
- [ ] Add server-side validation in `/api/meal-swaps`
- [ ] Update `swap-meal.ts` action
- [ ] Enhance UI with Pro/free indicators
- [ ] Test swap limits and unlimited access

### Phase 4: UI Component Library (Day 3)
- [ ] Create `FeatureLockedCard` component
- [ ] Create `ProBadge` component
- [ ] Create `FeatureGate` wrapper component
- [ ] Add to component library

### Phase 5: Additional Features (Day 4+)
- [ ] Gate other Pro features as needed
- [ ] Add Pro indicators throughout app
- [ ] Create upgrade prompts for locked features
- [ ] Analytics tracking for upgrade conversions

---

## 🎯 Design Principles

### 1. Progressive Disclosure
- Show previews of Pro features (blurred/teased)
- Make value proposition clear
- Reduce friction in upgrade flow

### 2. Visual Hierarchy
- Pro features clearly marked with badges
- Locked states visually distinct but not jarring
- Upgrade CTAs prominent but not intrusive

### 3. Consistent Language
- "Pro Feature" badge for locked items
- "Upgrade to Pro" for CTAs
- Clear feature descriptions

### 4. User Experience
- Fast subscription checks (cached where possible)
- Clear loading states
- Graceful error handling
- Smooth upgrade flow

---

## 📱 Responsive Design

### Mobile
- Stacked layout for locked views
- Full-width upgrade buttons
- Simplified preview cards

### Tablet
- 2-column grid for features
- Medium-sized preview cards
- Centered CTAs

### Desktop
- Full analytics preview (blurred)
- Side-by-side feature comparison
- Enhanced hover states

---

## 🔐 Security Checklist

- [ ] All subscription checks happen server-side
- [ ] API routes protected with subscription validation
- [ ] No client-side bypass possible
- [ ] Subscription status cached appropriately
- [ ] Webhook handlers verify Polar signatures
- [ ] Rate limiting on subscription checks (if needed)

---

## 📊 Analytics & Tracking

### Metrics to Track
- Upgrade conversion rate (from locked features)
- Feature usage (Pro vs Free)
- Upgrade funnel drop-off points
- Most viewed locked features
- Time to upgrade after viewing locked feature

### Implementation
```typescript
// Track upgrade intent
analytics.track('upgrade_intent', {
  featureId: 'nutrition-analytics',
  source: 'analytics_page',
  userId: session.user.id
})

// Track feature unlock
analytics.track('feature_unlocked', {
  featureId: 'nutrition-analytics',
  plan: 'pro',
  userId: session.user.id
})
```

---

## 🎨 Design Assets Needed

1. **Lock Icon** - For locked states (Lucide `Lock` icon)
2. **Crown Icon** - For Pro badges (Lucide `Crown` icon)
3. **Gradient Backgrounds** - Pro accent gradients
4. **Blur Overlays** - For preview states
5. **Loading Skeletons** - For subscription checks

---

## ✅ Definition of Done

### Analytics Page
- [ ] Free users see `AnalyticsLockedView`
- [ ] Pro users see full analytics
- [ ] Upgrade modal opens correctly
- [ ] Navigation shows lock icon for free users
- [ ] Pro badge shows in header for Pro users
- [ ] Real data loads for Pro users
- [ ] Responsive design works on all devices

### General Pro System
- [ ] All subscription checks server-side
- [ ] Client-side hooks work correctly
- [ ] Upgrade flow completes successfully
- [ ] Subscription status updates in real-time
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Design system consistent across app

---

## 📚 Reference Files

- **Hook**: `hooks/use-pro-features.ts`
- **Modal**: `components/SubscriptionModal.tsx`
- **API**: `app/api/subscription/route.ts`
- **Auth Config**: `lib/auth.ts` (Polar integration)
- **Schema**: `prisma/schema.prisma`
- **Data Layer**: `data/index.ts`

---

## 🚦 Next Steps

1. **Create subscription utility** (`lib/utils/subscription.ts`)
2. **Build AnalyticsLockedView component**
3. **Gate analytics page** (server-side)
4. **Add navigation indicators**
5. **Test upgrade flow end-to-end**

---

**Status**: Ready for implementation  
**Priority**: High  
**Estimated Time**: 2-3 days for full implementation

