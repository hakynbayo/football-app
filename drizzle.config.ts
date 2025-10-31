import type { Config } from "drizzle-kit";

// Use Turso if URL is provided, otherwise use local SQLite
const useTurso = process.env.TURSO_DATABASE_URL;

const config: Config = {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: useTurso ? "turso" : "sqlite",
  dbCredentials: useTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: "./data.sqlite",
      },
};

export default config;
