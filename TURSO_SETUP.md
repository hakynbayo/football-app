# Turso Database Setup Guide

This guide will help you set up Turso (SQLite-compatible cloud database) for your Football App on Netlify.

## Step 1: Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Or with Homebrew
brew install tursodatabase/tap/turso
```

## Step 2: Create Turso Account and Database

```bash
# Sign up (opens browser)
turso auth signup

# Create a new database
turso db create football-app

# Get your database URL
turso db show football-app --url

# Create an authentication token
turso db tokens create football-app
```

## Step 3: Set Up Environment Variables

### For Local Development

Create a `.env.local` file in the root directory:

```bash
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
AUTH_SECRET=your-random-secret-here
NEXTAUTH_SECRET=your-random-secret-here
```

### For Netlify Deployment

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:
   - `TURSO_DATABASE_URL`: Your database URL from Step 2
   - `TURSO_AUTH_TOKEN`: Your auth token from Step 2
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_SECRET`: Same as AUTH_SECRET
   - `NEXTAUTH_URL`: Your Netlify site URL (e.g., `https://your-site.netlify.app`)

## Step 4: Install Dependencies

```bash
yarn install
# or
pnpm install
# or
npm install
```

## Step 5: Push Database Schema

```bash
# Generate migrations
yarn db:generate

# Push schema to Turso
yarn db:migrate
```

## Step 6: Seed Initial Users (Optional)

Create an admin user:

```bash
yarn db:seed
```

This creates:

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

**Important**: Change these passwords in production!

## Step 7: Test Locally

```bash
yarn dev
```

Visit http://localhost:3000 and try logging in with the seeded credentials.

## Step 8: Deploy to Netlify

```bash
git add .
git commit -m "Migrate to Turso database"
git push
```

Netlify will automatically redeploy your site with the new database configuration.

## Troubleshooting

### "Database unavailable" error

- Check that `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set correctly in Netlify
- Verify the database exists: `turso db list`

### Migration errors

- Reset and regenerate: `yarn db:generate`
- Check your schema in `lib/db/schema.ts`

### Authentication not working

- Ensure `AUTH_SECRET` and `NEXTAUTH_SECRET` are set
- Check `NEXTAUTH_URL` matches your Netlify domain

## Turso Free Tier Limits

- **Databases**: 500
- **Storage**: 9 GB total
- **Rows read**: 1 billion per month
- **Rows written**: 25 million per month

Perfect for your football app! 🚀

## Useful Turso Commands

```bash
# List databases
turso db list

# Open database shell
turso db shell football-app

# View database info
turso db show football-app

# Create backup
turso db dump football-app > backup.sql
```

## Need Help?

- Turso Docs: https://docs.turso.tech
- Turso Discord: https://discord.gg/turso
