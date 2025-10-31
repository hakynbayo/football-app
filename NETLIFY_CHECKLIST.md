# ✅ Netlify Deployment Checklist

## Fix "Server error" on Netlify

Follow these steps **in order**:

### 1️⃣ Set Up Turso Database (If not done)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create account
turso auth signup

# Create database
turso db create football-app

# Get your database URL
turso db show football-app --url
# Example: libsql://football-app-username.turso.io

# Get your auth token
turso db tokens create football-app
# Example: eyJhbGc...long-token-string
```

**Save these!** You'll need them in the next step.

---

### 2️⃣ Add Environment Variables to Netlify

Go to: **Netlify Dashboard** → **Your Site** → **Site settings** → **Environment variables** → **Add a variable**

Add **ALL** of these (click "Add variable" for each one):

| Variable             | Value                             | How to Get                                  |
| -------------------- | --------------------------------- | ------------------------------------------- |
| `TURSO_DATABASE_URL` | `libsql://your-database.turso.io` | From `turso db show` command above          |
| `TURSO_AUTH_TOKEN`   | `eyJh...your-token`               | From `turso db tokens create` command above |
| `AUTH_SECRET`        | Generate random string            | Run: `openssl rand -base64 32`              |
| `NEXTAUTH_SECRET`    | Same as `AUTH_SECRET`             | Copy from AUTH_SECRET                       |
| `NEXTAUTH_URL`       | `https://your-site.netlify.app`   | Your actual Netlify URL                     |
| `NODE_ENV`           | `production`                      | Type exactly: `production`                  |

**Important**: Make sure there are **no spaces** or quotes around the values!

---

### 3️⃣ Push Database Schema to Turso

On your local machine:

```bash
# Create .env.local with Turso credentials
cat > .env.local << EOF
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
NODE_ENV=production
EOF

# Push schema to Turso
yarn db:migrate

# Seed users (creates admin/user accounts)
yarn db:seed
```

You should see:

```
✅ Created admin: admin@football.app
✅ Created user: user@football.app
```

---

### 4️⃣ Commit and Push Changes

```bash
git add .
git commit -m "Fix Netlify deployment with Turso"
git push
```

Netlify will automatically redeploy.

---

### 5️⃣ Test Your Deployment

After deployment completes (2-3 minutes):

#### A. Test Health Check

Visit: `https://your-site.netlify.app/api/health`

You should see:

```json
{
  "status": "ok",
  "database": "connected",
  "auth": "configured",
  "turso": "configured"
}
```

#### B. Test Main Page

Visit: `https://your-site.netlify.app`

You should see the login page.

#### C. Test Login

- Email: `admin@football.app`
- Password: `Admin@2525`

---

## 🚨 Still Getting Errors?

### Check #1: Verify Environment Variables

1. Go to Netlify → Site settings → Environment variables
2. Make sure **ALL 6 variables** are there
3. Check for typos or extra spaces
4. Make sure `NODE_ENV` is exactly `production` (lowercase)

### Check #2: View Netlify Logs

1. Go to **Deploys** tab
2. Click latest deploy
3. Look for error messages
4. Common errors:
   - "TURSO_DATABASE_URL not found" → Check env var spelling
   - "AUTH_SECRET missing" → Add AUTH_SECRET
   - "Module not found" → May need to clear cache

### Check #3: Clear Build Cache

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

### Check #4: Check Function Logs

1. Go to **Functions** tab
2. Look for runtime errors
3. This shows what's failing

---

## 📋 Quick Verification Checklist

Before asking for help, verify:

- [ ] Turso database exists (`turso db list`)
- [ ] Database schema migrated (`yarn db:migrate` completed successfully)
- [ ] Users seeded (`yarn db:seed` completed successfully)
- [ ] All 6 environment variables set in Netlify
- [ ] `NEXTAUTH_URL` matches your actual Netlify URL
- [ ] No typos in environment variable names
- [ ] Latest code pushed to Git
- [ ] Netlify build completed (green checkmark)
- [ ] `/api/health` returns success

---

## 🆘 Common Issues & Fixes

### Issue: "Database unavailable"

**Fix**:

- Check `TURSO_DATABASE_URL` is set in Netlify
- Check `TURSO_AUTH_TOKEN` is set in Netlify
- Verify database exists: `turso db list`

### Issue: "Invalid credentials" / Auth errors

**Fix**:

- Generate new `AUTH_SECRET`: `openssl rand -base64 32`
- Set both `AUTH_SECRET` and `NEXTAUTH_SECRET` to the same value
- Make sure `NEXTAUTH_URL` is your full Netlify URL (with https://)

### Issue: 404 errors

**Fix**:

- Check build completed successfully
- Look for build errors in **Deploys** tab
- Try clearing cache and redeploying

### Issue: "No users found" / Can't login

**Fix**:

- Run `yarn db:seed` locally with Turso credentials in `.env.local`
- Verify users exist in Turso: `turso db shell football-app` then `SELECT * FROM users;`

---

## 📞 Still Stuck?

Share these details:

1. Output of `/api/health` endpoint
2. Screenshot of Netlify environment variables (hide sensitive values!)
3. Any error messages from Netlify function logs
4. Build log (if build fails)

See **NETLIFY_TROUBLESHOOTING.md** for more detailed debugging steps.
