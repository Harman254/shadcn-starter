# 🔐 Inngest Environment Variables Setup

## Required Environment Variables for Production

Since your Inngest functions are already live, you need to configure these environment variables in your production environment (Vercel, Railway, etc.):

### **Critical (Required for Production)**

```env
# Signing Key - REQUIRED for secure communication with Inngest
# Get this from: Inngest Dashboard > Your App > Settings > Keys
INNGEST_SIGNING_KEY=signkey-prod-xxxxxxxxxxxxxxxxxxxxx
```

**Why it's needed:**
- Verifies that requests to `/api/inngest` are actually from Inngest's servers
- Prevents unauthorized access to your functions
- Required for production security

### **Recommended (For Event Sending)**

```env
# Event Key - Used when sending events from your app to Inngest
# Get this from: Inngest Dashboard > Your App > Settings > Keys
INNGEST_EVENT_KEY=eventkey-prod-xxxxxxxxxxxxxxxxxxxxx
```

**Why it's needed:**
- Allows your app to send events to Inngest (e.g., `inngest.send()`)
- Currently not used in your code, but useful for future event-driven functions
- Optional if you only use cron-triggered functions

### **Optional (Advanced Configuration)**

```env
# Environment Name - Useful for branch environments
INNGEST_ENV=production

# Base URL - Only needed if using custom Inngest instance
# Defaults to https://api.inngest.com/ for production
INNGEST_BASE_URL=https://api.inngest.com/

# Log Level - Controls Inngest SDK logging
# Options: fatal, error, warn, info, debug, silent
# Default: info
INNGEST_LOG_LEVEL=info
```

## How to Get Your Keys

1. **Go to Inngest Dashboard**: https://app.inngest.com
2. **Select your app**: "mealwise" (or whatever you named it)
3. **Navigate to**: Settings → Keys
4. **Copy the keys**:
   - **Signing Key**: `signkey-prod-...` (for `INNGEST_SIGNING_KEY`)
   - **Event Key**: `eventkey-prod-...` (for `INNGEST_EVENT_KEY`)

## Where to Add These

### **Vercel (Recommended)**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable for **Production** environment
4. Redeploy your app

### **Other Platforms**
- **Railway**: Project → Variables
- **Render**: Environment → Environment Variables
- **Fly.io**: `fly secrets set INNGEST_SIGNING_KEY=...`
- **Docker**: Add to `.env` file or docker-compose.yml

## Verification

After adding the environment variables:

1. **Check Inngest Dashboard**:
   - Your functions should show as "Active" ✅
   - You should see function runs in the "Runs" tab
   - No authentication errors in logs

2. **Test a Function**:
   - Go to Inngest Dashboard → Functions
   - Click on a function (e.g., "Weekly Meal Plan Reminder")
   - Click "Test" or "Run" to trigger manually
   - Check that it executes successfully

3. **Check Your App Logs**:
   - Look for successful function executions
   - No "Unauthorized" or "Invalid signature" errors

## Current Status

✅ **Your functions are registered** - They appear in Inngest dashboard  
⚠️ **Need signing key** - Add `INNGEST_SIGNING_KEY` for production security  
💡 **Event key optional** - Only needed if you send events from your app

## Troubleshooting

### Functions show but don't run
- ✅ Check `INNGEST_SIGNING_KEY` is set correctly
- ✅ Verify the key matches your Inngest app
- ✅ Ensure you redeployed after adding env vars

### "Invalid signature" errors
- ✅ Verify `INNGEST_SIGNING_KEY` is correct
- ✅ Check for typos or extra spaces
- ✅ Ensure it's set in the correct environment (Production)

### Functions not appearing in dashboard
- ✅ Check your Inngest app ID matches `"mealwise"` in `lib/inngest/client.ts`
- ✅ Verify the API route `/api/inngest` is accessible
- ✅ Check that functions are exported in `lib/inngest/functions/index.ts`

## Next Steps

1. **Add `INNGEST_SIGNING_KEY`** to your production environment variables
2. **Redeploy** your application
3. **Test** a function manually in Inngest dashboard
4. **Monitor** function runs and logs
5. **Optional**: Add `INNGEST_EVENT_KEY` if you plan to send events from your app

---

**Note**: The `serve()` handler in `app/api/inngest/route.ts` automatically uses `INNGEST_SIGNING_KEY` if it's set. No code changes needed - just add the environment variable!

