# 🔔 PushEngage Setup Guide

**Status:** Configuration Required  
**Last Updated:** January 2025

---

## ⚠️ Issues Found

1. **Push notification function not implemented** - ✅ **FIXED**
2. **Missing API key configuration** - ⚠️ **NEEDS SETUP**
3. **User subscription flow** - ✅ **Working (client-side)**

---

## 🔧 Setup Steps

### Step 1: Get PushEngage API Key

1. **Login to PushEngage Dashboard**
   - Go to: https://dashboard.pushengage.com/
   - Login with your account

2. **Navigate to API Settings**
   - Go to: **Settings** → **API Settings**
   - Or: **Settings** → **Developer** → **API**

3. **Generate/Copy API Key**
   - If you don't have an API key, click "Generate API Key"
   - Copy the API Key (it will look like: `pe_xxxxxxxxxxxxxxxxxxxxx`)

4. **Get Site ID**
   - Your Site ID is: `cf02cb04-3bc3-40bc-aef1-dc98cb81379d`
   - (Already configured in code)

---

### Step 2: Add Environment Variables

Add these to your `.env` or `.env.local` file:

```bash
# PushEngage Configuration
PUSHENGAGE_API_KEY=pe_your_api_key_here
PUSHENGAGE_SITE_ID=cf02cb04-3bc3-40bc-aef1-dc98cb81379d
```

**Important:** 
- Replace `pe_your_api_key_here` with your actual API key from Step 1
- The Site ID is already correct, but you can verify it in PushEngage dashboard

---

### Step 3: Verify Client-Side Setup

The client-side script is already configured in `components/PushEngageScript.tsx`:

```typescript
appId: 'cf02cb04-3bc3-40bc-aef1-dc98cb81379d'
```

**This is correct** - it matches your Site ID.

---

### Step 4: Test User Subscription

1. **Visit your website** (must be HTTPS in production)
2. **Look for push notification prompt** (browser will ask permission)
3. **Click "Allow"** to subscribe
4. **Verify in PushEngage Dashboard:**
   - Go to: **Subscribers** → **All Subscribers**
   - You should see your subscription

---

### Step 5: Test Notification Sending

#### Option A: Test via API Endpoint

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test push notification",
    "url": "https://www.aimealwise.com",
    "category": "test"
  }'
```

#### Option B: Test via Inngest Function

The notification functions will automatically send push notifications when triggered:
- Weekly meal plan reminders
- Pro plan expiration warnings
- Pantry expiration alerts
- Usage limit resets
- Meal plan completion
- Incomplete meal plan reminders
- Proactive meal suggestions

---

## 🔍 Troubleshooting

### Issue: "No notifications received"

**Checklist:**
1. ✅ API key is set in `.env` file
2. ✅ Restarted server after adding env variable
3. ✅ User has subscribed (clicked "Allow" on browser prompt)
4. ✅ Browser notifications are enabled
5. ✅ Testing on HTTPS (required for push notifications)
6. ✅ Check browser console for errors
7. ✅ Check server logs for PushEngage API errors

### Issue: "PushEngage API error: 401"

**Solution:**
- API key is incorrect or expired
- Regenerate API key in PushEngage dashboard
- Update `.env` file
- Restart server

### Issue: "PushEngage API error: 400"

**Solution:**
- Check notification payload format
- Verify Site ID matches dashboard
- Check API documentation: https://docs.pushengage.com/

### Issue: "User not subscribed"

**Solution:**
- User needs to click "Allow" on browser prompt
- Check if browser blocks notifications
- Verify HTTPS is enabled (required)
- Check PushEngage dashboard → Subscribers

---

## 📊 Verify Setup

### 1. Check Environment Variables

```bash
# In your terminal
echo $PUSHENGAGE_API_KEY
echo $PUSHENGAGE_SITE_ID
```

### 2. Check Server Logs

When a notification is sent, you should see:
```
[sendPushNotification] Successfully sent weekly-meal-plan-reminder to user xxx
```

If there's an error:
```
[sendPushNotification] PushEngage API error: 401
```

### 3. Check PushEngage Dashboard

- **Subscribers** → Should show your test subscription
- **Notifications** → Should show sent notifications
- **Analytics** → Should show delivery stats

---

## 🎯 Next Steps

1. **Add API key to `.env` file** ⚠️ **REQUIRED**
2. **Restart your development server**
3. **Test subscription** (visit site, allow notifications)
4. **Test sending** (use API endpoint or wait for scheduled notifications)
5. **Monitor dashboard** (check PushEngage for delivery stats)

---

## 📝 Code Changes Made

### ✅ Fixed: `lib/notifications/sender.ts`
- Implemented `sendPushNotification()` function
- Added proper error handling
- Added API key validation
- Integrated with PushEngage API

### ✅ Already Working:
- Client-side script (`components/PushEngageScript.tsx`)
- API endpoint (`app/api/notifications/send/route.ts`)
- Notification sender integration

---

## 🔗 Useful Links

- **PushEngage Dashboard:** https://dashboard.pushengage.com/
- **API Documentation:** https://docs.pushengage.com/api/
- **Support:** https://support.pushengage.com/

---

**Status:** ⚠️ **WAITING FOR API KEY CONFIGURATION**

Once you add the API key to `.env` and restart the server, push notifications should work!

