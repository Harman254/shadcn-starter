# Preferences Summary Caching Implementation

## Overview

The preferences summary is now cached in the database and only regenerated when preferences actually change. This significantly reduces AI API calls and improves performance.

## How It Works

### 1. **Database Schema Changes**
Added two new fields to `OnboardingData` table:
- `preferencesSummary` (TEXT, nullable) - Cached AI-generated one-sentence summary
- `preferencesHash` (TEXT, nullable) - SHA256 hash of preferences to detect changes

### 2. **Caching Logic** (`lib/utils/preferences-cache.ts`)

#### Hash Generation
- Creates a SHA256 hash of the preferences (excluding id/userId)
- Sorts preferences and cuisine arrays for consistent hashing
- Same preferences = same hash

#### Cache Check Flow
```
1. Fetch preferences from database
2. Calculate current hash of preferences
3. Check if hash matches stored hash AND summary exists
   - ✅ Match: Return cached summary (no AI call)
   - ❌ No match or missing: Generate new summary via AI
4. Save new summary and hash to database
```

### 3. **Cache Invalidation**

When preferences are saved (`actions/saveData.tsx`):
- Cache is automatically cleared (set to `null`)
- Next chat load will detect hash mismatch and regenerate

### 4. **Usage** (`app/chat/page.tsx`)

```typescript
// Automatically uses cache or generates if needed
preferencesSummary = await getOrGeneratePreferencesSummary(userId, preferences);
```

## Benefits

✅ **Performance**: No AI call on every page load  
✅ **Cost Savings**: Only calls AI when preferences actually change  
✅ **Automatic**: Works transparently - no manual cache management  
✅ **Reliable**: Hash-based change detection is accurate  

## Migration

Run the migration to add the new fields:
```bash
npx prisma migrate deploy
# or for development:
npx prisma migrate dev
```

The migration file is at: `prisma/migrations/20250120000000_add_preferences_cache/migration.sql`

## Example Flow

### First Time (No Cache)
1. User loads chat page
2. Preferences fetched
3. Hash calculated: `abc123...`
4. No cache found → AI generates summary
5. Summary + hash saved to database

### Subsequent Loads (Cache Hit)
1. User loads chat page
2. Preferences fetched
3. Hash calculated: `abc123...` (same as before)
4. Hash matches stored hash → Return cached summary
5. **No AI call!** ⚡

### After Preferences Change
1. User updates preferences
2. Cache cleared (hash/summary set to `null`)
3. User loads chat page
4. Hash calculated: `xyz789...` (different!)
5. Hash mismatch → AI generates new summary
6. New summary + hash saved

## Error Handling

- If cache lookup fails → Falls back to generating summary
- If AI generation fails → Returns empty string (chat works without preferences)
- Database errors are logged but don't block chat functionality

## Development Logging

In development mode, you'll see:
```
[getOrGeneratePreferencesSummary] Using cached summary
// or
[getOrGeneratePreferencesSummary] Generating new summary (hash changed or missing)
```

