import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { users } from "../lib/db/schema";
import * as schema from "../lib/db/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as dotenv from "dotenv";

type Database =
  | BetterSQLite3Database<typeof schema>
  | LibSQLDatabase<typeof schema>;

// Load environment variables
dotenv.config({ path: ".env.local" });

// Determine which database to use
const useTurso = process.env.TURSO_DATABASE_URL;

let db: Database;

if (useTurso) {
  // Use Turso (production/remote)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@libsql/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/libsql");

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error(
      "❌ TURSO_DATABASE_URL not found in environment variables.\n" +
        "Please create a .env.local file with your Turso credentials.\n" +
        "See TURSO_SETUP.md for instructions."
    );
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  db = drizzle(client, { schema });
  console.log("Using Turso database...\n");
} else {
  // Use local SQLite
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/better-sqlite3");

  const sqlite = new Database("data.sqlite");
  db = drizzle(sqlite, { schema });
  console.log("Using local SQLite database...\n");
}

async function resetAndSeed() {
  console.log("🗑️  Deleting all existing users...\n");

  try {
    // Delete all users first
    await db.delete(users);
    console.log("✅ All users deleted\n");
  } catch (error) {
    console.error("⚠️  Error deleting users:", error);
  }

  console.log("🌱 Seeding fresh users...\n");

  // Default users
  const defaultUsers = [
    {
      username: "admin",
      email: "admin@football.app",
      password: "Admin@2525",
      name: "Admin",
      role: "admin",
    },
    {
      username: "user",
      email: "user@football.app",
      password: "User1234",
      name: "User",
      role: "user",
    },
  ];

  for (const userData of defaultUsers) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const id = nanoid();

      console.log(`🔐 Hashing password for ${userData.email}...`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Hash: ${passwordHash.substring(0, 20)}...`);

      // Insert user
      await db.insert(users).values({
        id,
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        createdAt: new Date(),
      });

      console.log(
        `✅ Created ${userData.role}: ${userData.email}\n` +
          `   Username: ${userData.username}\n` +
          `   Password: ${userData.password}\n`
      );
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log("🎉 Reset and seeding complete!\n");
  console.log("⚠️  IMPORTANT: Change these passwords in production!");
  console.log("\n📋 Login with:");
  console.log("   Admin: admin@football.app / Admin@2525");
  console.log("   User:  user@football.app / User1234");
  process.exit(0);
}

resetAndSeed().catch((error) => {
  console.error("❌ Reset failed:", error);
  process.exit(1);
});

