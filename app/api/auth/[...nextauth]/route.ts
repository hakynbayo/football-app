import { handlers } from "@/lib/auth";

// Force Node.js runtime for serverless functions (required for SQLite)
export const runtime = "nodejs";

export const { GET, POST } = handlers;
