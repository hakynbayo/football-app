# 🔑 Default Credentials

After running `yarn db:seed`, these accounts will be created:

## Admin Account

- **Email**: `admin@football.app`
- **Username**: `admin`
- **Password**: `Admin@2525`
- **Role**: Admin (can manage teams, enter match results)

## Regular User Account

- **Email**: `user@football.app`
- **Username**: `user`
- **Password**: `User1234`
- **Role**: User (view only)

---

## 📝 Login Instructions

You can login with **either** the email or username:

- Using email: `admin@football.app` with password `Admin@2525`
- Using username: `admin` with password `Admin@2525`

## ⚠️ Security Notice

**These are default development credentials.**

For production:

1. Change these passwords immediately
2. Create unique admin credentials
3. Delete the default accounts if not needed

## 🔄 How to Seed

After setting up Turso and adding environment variables:

```bash
yarn db:seed
```

You'll see output like:

```
🌱 Seeding users to Turso database...

✅ Created admin: admin@football.app
   Username: admin
   Password: Admin@2525

✅ Created user: user@football.app
   Username: user
   Password: User1234

🎉 Seeding complete!
```
