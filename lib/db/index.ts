import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso database connection
// Make sure to set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment variables
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

try {
  if (!tursoUrl) {
    console.warn(
      "TURSO_DATABASE_URL not found. Database will not be available. " +
        "Please set up Turso and add environment variables."
    );
  } else {
    const client = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });

    db = drizzle(client, { schema });
    console.log("Turso database connected successfully");
  }
} catch (error) {
  console.error("Database initialization error:", error);
  // The app will handle this gracefully by checking if db is null
}

export { db };
