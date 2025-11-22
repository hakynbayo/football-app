import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { users } from "../lib/db/schema";
import * as schema from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
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
    console.error("❌ TURSO_DATABASE_URL not found");
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

async function updatePasswords() {
  console.log("🔐 Updating user passwords in Turso...\n");

  // Default passwords
  const credentials = [
    {
      email: "admin@football.app",
      password: "Admin@2525",
      role: "admin",
    },
    {
      email: "user@football.app",
      password: "User1234",
      role: "user",
    },
  ];

  for (const cred of credentials) {
    try {
      console.log(`📝 Updating ${cred.email}...`);

      // Generate new password hash
      const passwordHash = await bcrypt.hash(cred.password, 10);
      console.log(`   Password: ${cred.password}`);
      console.log(`   New hash: ${passwordHash.substring(0, 25)}...`);

      // Update the user's password
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.email, cred.email));

      console.log(`✅ Updated ${cred.role}: ${cred.email}\n`);
    } catch (error) {
      console.error(`❌ Error updating ${cred.email}:`, error);
    }
  }

  console.log("🎉 Password update complete!\n");
  console.log("📋 You can now login with:");
  console.log("   Admin: admin@football.app / Admin@2525");
  console.log("   User:  user@football.app / User1234");
  process.exit(0);
}

updatePasswords().catch((error) => {
  console.error("❌ Update failed:", error);
  process.exit(1);
});

