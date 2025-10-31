import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const sqlite = new Database("data.sqlite");
const db = drizzle(sqlite);

async function seedUsers() {
  console.log("Seeding users...");

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
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .get();

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
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

    console.log(`Created user: ${userData.email} (${userData.role})`);
  }

  console.log("Seeding complete!");
  sqlite.close();
}

seedUsers().catch(console.error);

