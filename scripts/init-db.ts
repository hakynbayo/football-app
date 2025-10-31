import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../lib/db/schema";

const sqlite = new Database("data.sqlite");
const db = drizzle(sqlite, { schema });

console.log("Database initialized successfully!");

sqlite.close();
