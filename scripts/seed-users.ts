import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Turso connection
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

const db = drizzle(client);

async function seedUsers() {
  console.log("🌱 Seeding users to Turso database...\n");

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
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .then((rows) => rows[0]);

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const id = nanoid();

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

  console.log("🎉 Seeding complete!\n");
  console.log("⚠️  IMPORTANT: Change these passwords in production!");
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
