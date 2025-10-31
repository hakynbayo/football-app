# 🔧 Netlify Troubleshooting Guide

## ❌ "Server error" or "There is a problem with the server configuration"

Follow these steps to diagnose and fix the issue:

### Step 1: Check Environment Variables

Go to: **Netlify Dashboard** → **Site settings** → **Environment variables**

You **must** have these set:

#### Required for NextAuth

```
AUTH_SECRET=your-random-32-char-string
NEXTAUTH_SECRET=same-as-auth-secret
NEXTAUTH_URL=https://your-site.netlify.app
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

#### Required for Turso Database

```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
NODE_ENV=production
```

### Step 2: Check Health Endpoint

After deploying, visit:

```
https://your-site.netlify.app/api/health
```

This will show you what's configured:

```json
{
  "status": "ok",
  "database": "connected",
  "auth": "configured",
  "turso": "configured"
}
```

If you see errors, they'll tell you what's missing.

### Step 3: Check Netlify Build Logs

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Look for errors in the build log
4. Common issues:
   - Missing dependencies
   - Build failures
   - Environment variable errors

### Step 4: Check Function Logs

1. Go to **Functions** tab in Netlify
2. Look for runtime errors
3. Common errors:
   - "Database unavailable" → Turso credentials not set
   - "AUTH_SECRET missing" → Auth credentials not set
   - Module not found → Dependency issue

### Step 5: Common Fixes

#### Fix 1: Missing AUTH_SECRET

```bash
# Generate a secret
openssl rand -base64 32

# Add to Netlify:
# Site settings → Environment variables → Add variable
AUTH_SECRET=<generated-secret>
NEXTAUTH_SECRET=<same-secret>
```

#### Fix 2: Missing NEXTAUTH_URL

```bash
# Add your Netlify URL
NEXTAUTH_URL=https://your-site.netlify.app
```

#### Fix 3: Turso Not Configured

```bash
# Create Turso database
turso db create football-app

# Get credentials
turso db show football-app --url
turso db tokens create football-app

# Add to Netlify environment variables
TURSO_DATABASE_URL=<your-url>
TURSO_AUTH_TOKEN=<your-token>
NODE_ENV=production
```

#### Fix 4: Schema Not Migrated to Turso

From your local machine:

```bash
# Add Turso credentials to .env.local
echo "TURSO_DATABASE_URL=libsql://..." >> .env.local
echo "TURSO_AUTH_TOKEN=..." >> .env.local

# Run migrations
yarn db:migrate

# Seed users
yarn db:seed
```

### Step 6: Test Locally with Production Config

Test with Turso locally before deploying:

```bash
# .env.local
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
NODE_ENV=production
AUTH_SECRET=test-secret
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000

# Run
yarn dev
```

Visit http://localhost:3000 - if it works locally, it should work on Netlify.

### Step 7: Redeploy

After fixing environment variables:

1. **Option A**: Trigger a redeploy in Netlify UI
2. **Option B**: Push a new commit:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

---

## 🔍 Quick Checklist

Use this checklist to verify everything is set:

- [ ] `AUTH_SECRET` is set in Netlify
- [ ] `NEXTAUTH_SECRET` is set in Netlify
- [ ] `NEXTAUTH_URL` matches your Netlify URL
- [ ] `TURSO_DATABASE_URL` is set in Netlify
- [ ] `TURSO_AUTH_TOKEN` is set in Netlify
- [ ] `NODE_ENV=production` is set in Netlify
- [ ] Turso database exists (`turso db list`)
- [ ] Schema migrated to Turso (`yarn db:migrate`)
- [ ] Users seeded in Turso (`yarn db:seed`)
- [ ] Health check works (`/api/health`)
- [ ] No build errors in Netlify logs

---

## 🆘 Still Not Working?

### Check Runtime Logs

1. Netlify Dashboard → **Functions** tab
2. Click on any function
3. Look for error messages

### Enable Debug Mode

Add to Netlify environment variables:

```
NODE_ENV=development
DEBUG=*
```

Redeploy and check logs for detailed error messages.

### Test Individual Routes

- Health check: `https://your-site.netlify.app/api/health`
- Auth: `https://your-site.netlify.app/api/auth/csrf`
- Main page: `https://your-site.netlify.app/`

### Common Error Messages

| Error                       | Cause                | Fix                                             |
| --------------------------- | -------------------- | ----------------------------------------------- |
| "Database unavailable"      | Turso not configured | Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` |
| "Invalid credentials"       | Wrong auth setup     | Check `AUTH_SECRET`                             |
| "404 Not Found"             | Build issue          | Check build logs                                |
| "500 Internal Server Error" | Runtime error        | Check function logs                             |
| "Module not found"          | Missing dependency   | Run `yarn install` and redeploy                 |

---

## 📝 Need More Help?

1. Check `/api/health` endpoint first
2. Review Netlify function logs
3. Test locally with production settings
4. Ensure all environment variables are set
5. Verify Turso database is accessible

If still stuck, share:

- Output of `/api/health`
- Netlify function logs
- Build logs (any errors)
