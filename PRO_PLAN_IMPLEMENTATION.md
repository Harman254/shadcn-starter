# Pro Plan Implementation Plan
## Analytics Page & Meal Swap Feature

**Date:** Current  
**Status:** Planning Phase  
**Priority:** High

---

## 📋 Overview

This document outlines the implementation plan for making two features Pro-only:
1. **Analytics Page** - Full access requires Pro subscription
2. **Meal Swap Feature** - Unlimited swaps require Pro subscription (free users have limited swaps)

---

## 🎯 Feature 1: Analytics Page (Pro-Only)

### Current State
- **Location:** `app/(dashboard)/dashboard/analytics/page.tsx`
- **Status:** Currently shows mock/hardcoded data
- **Access Control:** None - accessible to all users
- **Pro Feature ID:** `nutrition-analytics` (already defined in `PRO_FEATURES`)

### Implementation Tasks

#### 1.1 Server-Side Access Control
**File:** `app/(dashboard)/dashboard/analytics/page.tsx`

**Tasks:**
- [ ] Convert to async server component
- [ ] Fetch user subscription status using `getSubscriptionByUserId()`
- [ ] Check if user has `nutrition-analytics` feature or `plan === "pro"`
- [ ] If not Pro, redirect to upgrade page or show locked state
- [ ] If Pro, fetch real analytics data (already implemented in previous work)

**Code Structure:**
```typescript
export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in');
  
  const subscription = await getSubscriptionByUserId(session.user.id);
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  const hasAnalytics = subscription?.features?.includes('nutrition-analytics') || isPro;
  
  if (!hasAnalytics) {
    // Show locked/upgrade UI
    return <AnalyticsLockedView />;
  }
  
  // Fetch and display real analytics data
  const analyticsData = await fetchAnalyticsData(session.user.id);
  return <AnalyticsContent data={analyticsData} />;
}
```

#### 1.2 Client-Side UI Components
**Files:** 
- `app/(dashboard)/dashboard/analytics/AnalyticsLockedView.tsx` (new)
- Update existing analytics components

**Tasks:**
- [ ] Create `AnalyticsLockedView` component showing:
  - Locked icon/badge
  - Feature description
  - "Upgrade to Pro" CTA button
  - Preview of what analytics includes (blurred/teaser)
- [ ] Use `useProFeatures()` hook for upgrade modal integration
- [ ] Add Pro badge/indicator to analytics header when unlocked

**UI Elements:**
- Lock icon with "Pro Feature" badge
- Feature description: "Get detailed nutrition tracking and analytics"
- Upgrade button that opens subscription modal
- Optional: Blurred preview of analytics charts

#### 1.3 Navigation Protection
**File:** `app/(dashboard)/dashboard-links.tsx` or navigation component

**Tasks:**
- [ ] Add visual indicator (lock icon) next to Analytics link for non-Pro users
- [ ] Optional: Hide Analytics link entirely for free users (or show with lock)
- [ ] Show Pro badge when user has access

#### 1.4 API Route Protection (if needed)
**File:** `app/api/analytics/route.ts` (if exists)

**Tasks:**
- [ ] Add subscription check in API route
- [ ] Return 403 Forbidden if user doesn't have Pro access
- [ ] Include upgrade message in error response

---

## 🎯 Feature 2: Meal Swap Feature (Pro-Only Unlimited)

### Current State
- **Location:** `app/meal-plans/[id]/components/meal-actions.tsx`
- **Status:** Partially implemented with swap limits
- **Access Control:** 
  - Free users: Limited swaps per week (via `MealSwapCount` table)
  - Pro users: Should have unlimited swaps (checked via `hasFeature("unlimited-meal-plans")`)
- **Issue:** Swap limits are enforced, but Pro check might not be fully working

### Implementation Tasks

#### 2.1 Verify Pro Feature Check
**File:** `app/meal-plans/[id]/components/meal-actions.tsx`

**Current Logic:**
```typescript
const isUnlimitedSwaps = hasFeature("unlimited-meal-plans");
```

**Tasks:**
- [ ] Verify `hasFeature("unlimited-meal-plans")` correctly identifies Pro users
- [ ] Ensure subscription status is properly fetched on component mount
- [ ] Add loading state while checking subscription
- [ ] Add error handling for subscription check failures

**Verification Checklist:**
- [ ] Pro users see "Unlimited swaps" badge
- [ ] Pro users can swap without limit checks
- [ ] Free users see swap count (e.g., "3/5 swaps remaining")
- [ ] Free users get upgrade prompt when limit reached

#### 2.2 Server-Side Swap Validation
**File:** `app/api/meal-swaps/route.ts`

**Tasks:**
- [ ] Add subscription check in POST endpoint
- [ ] For Pro users: Skip swap count validation entirely
- [ ] For Free users: Enforce weekly swap limits
- [ ] Return appropriate error messages with upgrade prompts

**Code Structure:**
```typescript
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const subscription = await getSubscriptionByUserId(session.user.id);
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  const hasUnlimited = subscription?.features?.includes('unlimited-meal-plans') || isPro;
  
  if (hasUnlimited) {
    // Pro users: No limit check, allow swap
    return NextResponse.json({ success: true, unlimited: true });
  }
  
  // Free users: Check swap count
  const swapCount = await getSwapCountForWeek(session.user.id);
  if (swapCount >= MAX_FREE_SWAPS) {
    return NextResponse.json({ 
      error: "Swap limit reached", 
      upgradeRequired: true,
      message: "Upgrade to Pro for unlimited swaps"
    }, { status: 403 });
  }
  
  // Increment swap count and allow swap
  await incrementSwapCount(session.user.id);
  return NextResponse.json({ success: true, swapsRemaining: MAX_FREE_SWAPS - swapCount - 1 });
}
```

#### 2.3 Swap Action Server-Side Check
**File:** `actions/swap-meal.ts`

**Tasks:**
- [ ] Add subscription check before executing swap
- [ ] For Pro users: Skip validation, proceed with swap
- [ ] For Free users: Validate swap count before proceeding
- [ ] Return clear error messages for upgrade prompts

#### 2.4 UI Enhancements
**File:** `app/meal-plans/[id]/components/meal-actions.tsx`

**Tasks:**
- [ ] Improve swap limit display for free users
- [ ] Show "Unlimited" badge for Pro users
- [ ] Add upgrade CTA when limit is reached
- [ ] Improve loading states during swap operations
- [ ] Add success/error toast messages

**UI States:**
- **Pro User:** "Unlimited swaps" badge, no count display
- **Free User (has swaps):** "3/5 swaps remaining this week"
- **Free User (limit reached):** "Swap limit reached" + Upgrade button
- **Loading:** Disable swap button, show spinner

#### 2.5 Swap Tool Integration
**File:** `lib/orchestration/ai-tools.ts` (swapMeal tool)

**Tasks:**
- [ ] Add subscription check in `swapMeal` tool execution
- [ ] For Pro users: Allow unlimited swaps
- [ ] For Free users: Check swap count before generating new meal
- [ ] Return appropriate error messages

---

## 🔧 Shared Implementation Components

### 3.1 Subscription Check Utility
**File:** `lib/utils/subscription.ts` (new)

**Tasks:**
- [ ] Create reusable function to check subscription status
- [ ] Create function to check specific feature access
- [ ] Add caching for subscription checks (optional)
- [ ] Add TypeScript types for subscription status

**Function Signatures:**
```typescript
export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus>
export async function hasProFeature(userId: string, featureId: string): Promise<boolean>
export async function isProUser(userId: string): Promise<boolean>
```

### 3.2 Upgrade Modal Integration
**Files:** 
- `components/SubscriptionModal.tsx` (existing)
- `hooks/use-pro-features.ts` (existing)

**Tasks:**
- [ ] Ensure upgrade modal works for both features
- [ ] Add feature-specific upgrade messages
- [ ] Test modal opening from both analytics and swap features
- [ ] Add analytics tracking for upgrade clicks

### 3.3 Error Messages & User Feedback
**Tasks:**
- [ ] Standardize upgrade prompt messages
- [ ] Add toast notifications for limit reached
- [ ] Create consistent "Pro Feature" badges
- [ ] Add help text explaining Pro benefits

---

## 📊 Database Considerations

### Current Schema
- ✅ `subscription` table exists with `plan`, `status`, `features` fields
- ✅ `MealSwapCount` table exists for tracking free user swaps
- ✅ `UserAnalytics` table exists (if needed for analytics)

### No Schema Changes Required
All necessary tables already exist. No migrations needed.

---

## 🧪 Testing Checklist

### Analytics Page
- [ ] Free user sees locked view with upgrade CTA
- [ ] Pro user sees full analytics with real data
- [ ] Navigation shows lock icon for free users
- [ ] Upgrade modal opens correctly from analytics page
- [ ] After upgrade, analytics page becomes accessible
- [ ] Analytics data loads correctly for Pro users

### Meal Swap Feature
- [ ] Free user sees swap count (e.g., "3/5 remaining")
- [ ] Free user can swap meals up to limit
- [ ] Free user gets upgrade prompt when limit reached
- [ ] Pro user sees "Unlimited swaps" badge
- [ ] Pro user can swap unlimited times
- [ ] Swap count resets weekly for free users
- [ ] Server-side validation prevents bypassing limits
- [ ] Swap action works correctly for both user types

### Edge Cases
- [ ] User without subscription (defaults to free)
- [ ] Subscription expired (should revert to free)
- [ ] Subscription status loading states
- [ ] Network errors during subscription check
- [ ] Concurrent swap attempts

---

## 🚀 Implementation Order

### Phase 1: Foundation (Day 1)
1. Create subscription check utility (`lib/utils/subscription.ts`)
2. Test subscription API endpoints
3. Verify Pro feature definitions

### Phase 2: Analytics Page (Day 1-2)
1. Add server-side access control to analytics page
2. Create `AnalyticsLockedView` component
3. Update navigation with lock indicators
4. Test analytics page access control

### Phase 3: Meal Swap Enhancement (Day 2-3)
1. Verify and fix Pro check in `meal-actions.tsx`
2. Add server-side validation in `/api/meal-swaps`
3. Update `swap-meal.ts` action with subscription check
4. Enhance UI with better Pro/free indicators
5. Test swap limits and unlimited access

### Phase 4: Polish & Testing (Day 3)
1. Standardize error messages
2. Add loading states
3. Test all edge cases
4. Update documentation

---

## 📝 Files to Modify

### New Files
- [ ] `lib/utils/subscription.ts` - Subscription check utilities
- [ ] `app/(dashboard)/dashboard/analytics/AnalyticsLockedView.tsx` - Locked state UI

### Modified Files
- [ ] `app/(dashboard)/dashboard/analytics/page.tsx` - Add access control
- [ ] `app/meal-plans/[id]/components/meal-actions.tsx` - Enhance Pro check
- [ ] `app/api/meal-swaps/route.ts` - Add server-side validation
- [ ] `actions/swap-meal.ts` - Add subscription check
- [ ] `app/(dashboard)/dashboard-links.tsx` - Add lock indicators
- [ ] `lib/orchestration/ai-tools.ts` - Add check to swapMeal tool (optional)

---

## 🎨 UI/UX Considerations

### Analytics Page
- **Locked State:** Show preview with blur, clear upgrade CTA
- **Unlocked State:** Show Pro badge in header
- **Navigation:** Lock icon next to Analytics link for free users

### Meal Swap
- **Free Users:** Clear swap count display, upgrade prompt at limit
- **Pro Users:** "Unlimited" badge, no count shown
- **Loading:** Disable buttons during swap operations
- **Success/Error:** Clear toast notifications

---

## 🔒 Security Considerations

1. **Server-Side Validation:** All checks must happen server-side
2. **API Protection:** Protect all API routes with subscription checks
3. **No Client-Side Bypass:** Never rely solely on client-side checks
4. **Rate Limiting:** Consider rate limits for swap operations
5. **Audit Logging:** Log subscription checks for debugging

---

## 📈 Success Metrics

### Analytics Page
- Conversion rate: Free users → Pro (from analytics page)
- Engagement: Pro users viewing analytics regularly
- Error rate: Failed subscription checks

### Meal Swap
- Swap usage: Average swaps per user (free vs Pro)
- Upgrade conversions: Users upgrading after hitting swap limit
- User satisfaction: Feedback on swap limits

---

## 🐛 Known Issues to Address

1. **Swap Feature:** Verify `hasFeature("unlimited-meal-plans")` correctly identifies Pro users
2. **Analytics:** Currently shows mock data - needs real data integration
3. **Subscription Loading:** Add proper loading states during subscription checks
4. **Error Handling:** Improve error messages for subscription failures

---

## 📚 References

- Pro Features Definition: `hooks/use-pro-features.ts`
- Subscription Schema: `prisma/schema.prisma`
- Subscription API: `app/api/subscription/route.ts`
- Swap Count API: `app/api/meal-swaps/route.ts`
- Swap Store: `components/meal-swap-store.ts`

---

## ✅ Definition of Done

### Analytics Page
- [ ] Free users see locked view
- [ ] Pro users see full analytics
- [ ] Upgrade flow works correctly
- [ ] Navigation shows appropriate indicators
- [ ] Real data loads for Pro users

### Meal Swap
- [ ] Free users have swap limits enforced
- [ ] Pro users have unlimited swaps
- [ ] Server-side validation prevents bypassing
- [ ] UI clearly shows swap status
- [ ] Upgrade prompts work correctly

### General
- [ ] All tests pass
- [ ] No console errors
- [ ] Loading states implemented
- [ ] Error handling comprehensive
- [ ] Documentation updated

---

**Next Steps:** Begin with Phase 1 (Foundation) - Create subscription check utility.

