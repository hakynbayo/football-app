# 🔄 Hybrid Database Setup

Your Football App now supports **both** local SQLite and Turso databases!

## How It Works

The app **automatically** switches between databases based on your environment:

### 🏠 Local Development (Default)
- **Database**: SQLite (`data.sqlite`)
- **No setup needed**: Just run `yarn dev`
- **Fast**: No network calls, everything local
- **Perfect for**: Development and testing

### 🌐 Production (Netlify)
- **Database**: Turso (cloud SQLite)
- **Setup required**: Add Turso credentials to Netlify
- **Works with**: Serverless functions
- **Perfect for**: Deployed apps

## 🚀 Quick Start

### For Local Development (No Turso Needed!)

1. **Generate database schema**:
   ```bash
   yarn db:generate
   yarn db:migrate
   ```

2. **Seed users**:
   ```bash
   yarn db:seed
   ```

3. **Start dev server**:
   ```bash
   yarn dev
   ```

That's it! The app uses local SQLite automatically.

### For Production (Netlify)

Follow the **TURSO_SETUP.md** guide to:
1. Create a Turso account
2. Get credentials
3. Add to Netlify environment variables

## 🎯 Environment Detection

The database switches based on:

| Environment | Database Used | Trigger |
|------------|---------------|---------|
| **Development** | Local SQLite | Default (no `TURSO_DATABASE_URL` or `NODE_ENV !== "production"`) |
| **Production** | Turso | `TURSO_DATABASE_URL` set + `NODE_ENV === "production"` |

## 📁 Files Involved

- **`lib/db/index.ts`**: Handles database switching
- **`drizzle.config.ts`**: Configures Drizzle for both databases
- **`scripts/seed-users.ts`**: Seeds either database

## 🔧 Commands

All commands work with **both** databases automatically:

```bash
# Generate schema migrations
yarn db:generate

# Run migrations (creates tables)
yarn db:migrate

# Seed users (admin/user accounts)
yarn db:seed

# Start dev server
yarn dev
```

## 📦 Local Database File

- **Location**: `data.sqlite` (in project root)
- **Gitignored**: ✅ Already in `.gitignore`
- **Migrations**: Auto-run on startup
- **Reset**: Delete `data.sqlite` and run migrations again

## 🆕 Testing Turso Locally

Want to test Turso before deploying?

1. Create a Turso database (see TURSO_SETUP.md)
2. Create `.env.local`:
   ```bash
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-token
   NODE_ENV=production
   ```
3. Run the app: `yarn dev`

## 🎉 Benefits

### Local Development
- ✅ No account setup needed
- ✅ Fast (no network latency)
- ✅ Works offline
- ✅ Easy to reset/test

### Production
- ✅ Works on Netlify serverless
- ✅ Persistent data
- ✅ Auto-scaling
- ✅ Edge-distributed

## 🔑 Default Credentials

After seeding (either database):
- **Admin**: `admin@football.app` / `Admin@2525`
- **User**: `user@football.app` / `User1234`

See **CREDENTIALS.md** for more details.

## 🐛 Troubleshooting

### "Database unavailable" error locally
- Make sure `data.sqlite` exists
- Run: `yarn db:migrate`
- Check file permissions

### "Database unavailable" on Netlify
- Verify Turso credentials in Netlify environment variables
- Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Ensure `NODE_ENV=production` is set

### Seed script issues
- **Local**: Ensure `data.sqlite` exists
- **Turso**: Check credentials in `.env.local`

## 📚 Next Steps

- **Local Development**: You're ready! Just run `yarn dev`
- **Production Deploy**: Follow **TURSO_SETUP.md**
- **Credentials**: Check **CREDENTIALS.md**

---

**Best of both worlds!** 🎉

