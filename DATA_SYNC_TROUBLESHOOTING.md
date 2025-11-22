# 🔄 Data Sync Troubleshooting Guide

If data is not syncing across devices or clears on refresh, follow these steps:

## 🔍 Step 1: Check Browser Console

Open your browser's developer console (F12) and look for:

- ✅ **Success messages**: "✅ Teams loaded from database", "✅ Matches saved to database"
- ❌ **Error messages**: "❌ Not authenticated", "❌ Error fetching teams"
- ⚠️ **Warning messages**: "⚠️ Not authenticated - cannot fetch teams"

## 🔍 Step 2: Check Database Tables

Visit: `https://your-site.netlify.app/api/health`

Look for the `tables` field. All should be `true`:

```json
{
  "tables": {
    "appTeams": true,
    "appMatches": true,
    "appStats": true,
    "appTeamOfTheWeek": true
  }
}
```

**If any are `false`, the migration hasn't been run!**

### Fix: Run Migration on Turso

From your local machine with Turso credentials in `.env.local`:

```bash
# Make sure you have Turso credentials
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
NODE_ENV=production

# Run migration
yarn db:migrate
```

## 🔍 Step 3: Check Authentication

Make sure you're logged in! The API routes require authentication.

1. Check if you see login/logout buttons
2. Try logging out and back in
3. Check browser console for "⚠️ Not authenticated" messages

## 🔍 Step 4: Check Network Tab

1. Open browser DevTools → Network tab
2. Refresh the page
3. Look for requests to `/api/data/*`
4. Check their status codes:
   - **200** = Success ✅
   - **401** = Not authenticated ❌
   - **500** = Server error ❌

## 🔍 Step 5: Verify Data is Being Saved

1. Add some data (teams, matches, etc.)
2. Check browser console for "✅ Teams saved to database"
3. Check Network tab - the POST request should return `200`
4. Refresh the page
5. Check if data persists

## 🐛 Common Issues

### Issue 1: "Not authenticated" errors

**Cause**: Not logged in or session expired

**Fix**: 
- Log in again
- Check that `NEXTAUTH_URL` is set correctly in Netlify
- Check that `AUTH_SECRET` and `NEXTAUTH_SECRET` are set

### Issue 2: Tables don't exist

**Cause**: Migration not run on Turso

**Fix**: Run `yarn db:migrate` with Turso credentials

### Issue 3: Data saves but doesn't load

**Cause**: GET requests failing silently

**Fix**: 
- Check browser console for errors
- Check Network tab for failed requests
- Verify you're logged in

### Issue 4: Data clears on refresh

**Cause**: 
- Tables don't exist (data not persisting)
- Not authenticated (can't fetch data)
- API errors (check console)

**Fix**: Follow steps 1-5 above

## 📊 Debug Checklist

- [ ] Browser console shows "✅ TURSO DATABASE CONNECTED"
- [ ] `/api/health` shows all tables exist
- [ ] You're logged in (see user info in UI)
- [ ] Network tab shows 200 responses for API calls
- [ ] Console shows "✅ Teams loaded from database" on page load
- [ ] Console shows "✅ Teams saved to database" when saving

## 🆘 Still Not Working?

1. **Check Netlify Function Logs**:
   - Netlify Dashboard → Functions tab
   - Look for errors in recent invocations

2. **Test API Directly**:
   - Visit `https://your-site.netlify.app/api/data/teams` (should require login)
   - Check response in Network tab

3. **Verify Environment Variables**:
   - `TURSO_DATABASE_URL` is set
   - `TURSO_AUTH_TOKEN` is set
   - `NODE_ENV=production` is set
   - `AUTH_SECRET` is set
   - `NEXTAUTH_SECRET` is set
   - `NEXTAUTH_URL` matches your site URL

