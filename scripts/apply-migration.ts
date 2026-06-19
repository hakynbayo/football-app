import * as dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function applyMigration() {
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

  // Read the migration file
  const migrationPath = join(process.cwd(), "drizzle", "0002_shared_app_data.sql");
  const migrationSQL = readFileSync(migrationPath, "utf-8");

  // Split by statement-breakpoint and execute each statement
  // First, remove comments and split by statement-breakpoint
  let statements = migrationSQL
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  
  // If the first part doesn't start with CREATE, it might be a comment - handle it
  statements = statements.map(s => {
    // Remove leading comments
    const lines = s.split('\n');
    const sqlLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    return sqlLines.join('\n');
  }).filter(s => s.length > 0 && s.toUpperCase().includes('CREATE'));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim()) {
      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(statement.substring(0, 100) + "...");
        await client.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`⚠️  Statement ${i + 1} - table already exists (skipping)`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          throw error;
        }
      }
    }
  }

  console.log("\n✅ Migration applied successfully!");
  
  // Verify tables exist
  console.log("\n🔍 Verifying tables...");
  const tables = ["app_teams", "app_matches", "app_stats", "app_team_of_week"];
  
  for (const table of tables) {
    try {
      await client.execute(`SELECT 1 FROM ${table} LIMIT 1`);
      console.log(`✅ Table ${table} exists`);
    } catch (error) {
      console.error(`❌ Table ${table} does not exist:`, error);
    }
  }

  await client.close();
}

applyMigration().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

