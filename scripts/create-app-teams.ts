import * as dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config({ path: ".env.local" });

async function createAppTeams() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoAuthToken) {
    console.error("❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    process.exit(1);
  }

  console.log("🔌 Connecting to Turso...");
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS app_teams (
      id text PRIMARY KEY NOT NULL,
      data text NOT NULL,
      updated_at integer NOT NULL,
      updated_by text
    );
  `;

  try {
    console.log("🔄 Creating app_teams table...");
    await client.execute(createTableSQL);
    console.log("✅ app_teams table created successfully!");
    
    // Verify
    await client.execute("SELECT 1 FROM app_teams LIMIT 1");
    console.log("✅ Verified: app_teams table exists");
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      console.log("⚠️  Table already exists");
    } else {
      console.error("❌ Error:", error);
      throw error;
    }
  }

  await client.close();
}

createAppTeams().catch((error) => {
  console.error("❌ Failed:", error);
  process.exit(1);
});

