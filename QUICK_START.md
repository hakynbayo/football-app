# 🚀 Quick Start - Hybrid Database Setup

Your Football App now supports **both** local SQLite and Turso!

## 🏠 Local Development (Easiest - Start Here!)

No Turso account needed for local development!

### 1. Install Dependencies

```bash
yarn install
```

### 2. Generate Database Schema

```bash
yarn db:generate
yarn db:migrate
```

### 3. Seed Users

```bash
yarn db:seed
```

Creates:

- Admin: `admin@football.app` / `Admin@2525`
- User: `user@football.app` / `User1234`

### 4. Start Dev Server

```bash
yarn dev
```

Visit http://localhost:3000 and login! 🎉

---

## 🌐 Production Deployment (Netlify with Turso)

Only needed when deploying to Netlify.

### 1. Set Up Turso Account

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up
turso auth signup

# Create database
turso db create football-app

# Get credentials (save these!)
turso db show football-app --url
turso db tokens create football-app
```

### 2. Add Environment Variables to Netlify

Go to: **Site settings** → **Environment variables**

Add:

```
TURSO_DATABASE_URL=libsql://football-app-xxx.turso.io
TURSO_AUTH_TOKEN=eyJh...your-token
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_SECRET=same-as-auth-secret
NEXTAUTH_URL=https://your-site.netlify.app
NODE_ENV=production
```

### 3. Push Schema to Turso

From your local machine with `.env.local` containing Turso credentials:

```bash
TURSO_DATABASE_URL=... yarn db:migrate
TURSO_DATABASE_URL=... yarn db:seed
```

### 4. Deploy

```bash
git add .
git commit -m "Deploy with Turso"
git push
```

Netlify will automatically deploy! 🚀

---

## 🔄 How It Works

The app **automatically** switches databases:

- **Local Dev**: Uses `data.sqlite` (no setup needed)
- **Production**: Uses Turso when `TURSO_DATABASE_URL` + `NODE_ENV=production`

See **HYBRID_DATABASE.md** for more details.

---

## 🔑 Default Credentials

- **Admin**: `admin@football.app` or `admin` / `Admin@2525`
- **User**: `user@football.app` or `user` / `User1234`

⚠️ **Change these in production!**

---

## 📚 Documentation

- **HYBRID_DATABASE.md** - How the hybrid setup works
- **TURSO_SETUP.md** - Detailed Turso setup guide
- **CREDENTIALS.md** - User credentials reference

---

## 🎯 Common Commands

```bash
yarn dev              # Start dev server (uses local SQLite)
yarn build            # Build for production
yarn db:generate      # Generate migrations
yarn db:migrate       # Run migrations
yarn db:seed          # Seed users
```

---

## 🎉 You're Ready!

For local development, you're all set! Just run `yarn dev`.

For production deployment, follow the Turso setup above.

**Happy coding!** ⚽
