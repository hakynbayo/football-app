import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// Extend the authConfig with database operations
const configWithDb = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Auth: Missing credentials");
          return null;
        }

        try {
          // Check if database is available
          if (!db) {
            console.error("❌ Auth: Database not initialized");
            throw new Error("Database unavailable");
          }

          console.log(
            "✅ Auth: Database available, attempting login for:",
            credentials.email
          );

          // Support both email and username login
          const emailOrUsername = credentials.email as string;
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.email, emailOrUsername));

          console.log(`📊 Auth: Found ${userResults.length} users by email`);

          let user = userResults[0];

          // If not found by email, try by username
          if (!user) {
            console.log("🔍 Auth: Searching by username...");
            const allUsers = await db.select().from(users);
            console.log(`📊 Auth: Total users in database: ${allUsers.length}`);
            const foundUser = allUsers.find(
              (u) => u.name?.toLowerCase() === emailOrUsername.toLowerCase()
            );
            if (!foundUser) {
              console.log("❌ Auth: User not found");
              return null;
            }
            user = foundUser;
            console.log("✅ Auth: User found by username");
          } else {
            console.log("✅ Auth: User found by email");
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            console.log("❌ Auth: Invalid password");
            return null;
          }

          console.log("✅ Auth: Login successful for:", user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Auth: Authorization error:", error);
          // Return null on error to prevent leaking error details
          return null;
        }
      },
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...configWithDb,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for Netlify deployment
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper function to register new users
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  if (!db) {
    throw new Error(
      "Database unavailable. SQLite is not supported on serverless platforms like Netlify. Please use a cloud database."
    );
  }

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUsers.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = nanoid();

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash,
    role: "user", // Default role for new registrations
    createdAt: new Date(),
  });

  return id;
}
