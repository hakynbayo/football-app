import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

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
          if (!db) {
            return null;
          }

          const emailOrUsername = credentials.email as string;
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.email, emailOrUsername));

          let user = userResults[0];

          // If not found by email, try by username (name field)
          if (!user) {
            const usernameResults = await db
              .select()
              .from(users)
              .where(eq(users.name, emailOrUsername));

            if (usernameResults.length === 0) {
              return null;
            }
            user = usernameResults[0];
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash,
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
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...configWithDb,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
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
  password: string,
) {
  if (!db) {
    throw new Error(
      "Database unavailable. SQLite is not supported on serverless platforms like Netlify. Please use a cloud database.",
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
    role: "user",
    createdAt: new Date(),
  });

  return id;
}
