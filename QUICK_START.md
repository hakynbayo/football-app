# 🚀 Quick Start - Turso Migration

Your Football App has been migrated from SQLite to Turso! Here's what to do next:

## ✅ What Changed

- ✨ **Database**: Migrated from `better-sqlite3` to `@libsql/client` (Turso)
- 🔧 **Config**: Updated `drizzle.config.ts` for Turso
- 📦 **Dependencies**: Installed `@libsql/client`
- 🌐 **Netlify**: Updated `netlify.toml` for serverless deployment

## 🎯 Next Steps

### 1. Set Up Turso Account (5 minutes)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up (opens browser)
turso auth signup

# Create database
turso db create football-app

# Get credentials (save these!)
turso db show football-app --url
turso db tokens create football-app
```

### 2. Set Environment Variables

#### For Local Development:

Create `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://football-app-xxx.turso.io
TURSO_AUTH_TOKEN=eyJh...your-token
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_SECRET=same-as-auth-secret
NEXTAUTH_URL=http://localhost:3000
```

#### For Netlify:

Go to: **Site settings** → **Environment variables**

Add:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your Netlify URL)

### 3. Push Database Schema

```bash
# Generate migrations (if needed)
yarn db:generate

# Push to Turso
yarn db:migrate
```

### 4. Seed Users (Optional)

```bash
yarn db:seed
```

Creates:

- Admin: `admin` / `admin123`
- User: `user` / `user123`

### 5. Test Locally

```bash
yarn dev
```

Visit http://localhost:3000 and test login!

### 6. Deploy to Netlify

```bash
git add .
git commit -m "Migrate to Turso database"
git push
```

## 📚 Need More Help?

See detailed setup guide: **TURSO_SETUP.md**

## 🎉 That's It!

Your app will now work perfectly on Netlify with authentication! 🚀
