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
          return null;
        }

        try {
          // Check if database is available
          if (!db) {
            console.error("Database not initialized");
            throw new Error("Database unavailable");
          }

          // Support both email and username login
          const emailOrUsername = credentials.email as string;
          let user = await db
            .select()
            .from(users)
            .where(eq(users.email, emailOrUsername))
            .get();

          // If not found by email, try by username
          if (!user) {
            const allUsers = await db.select().from(users).all();
            user = allUsers.find(
              (u) => u.name?.toLowerCase() === emailOrUsername.toLowerCase()
            );
          }

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
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

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existingUser) {
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
