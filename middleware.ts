import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware disabled to avoid edge runtime issues with SQLite
// Authentication is handled in API routes and pages instead
// This function exists to satisfy Netlify's requirement but does nothing due to empty matcher

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // No-op middleware - matcher is empty so this never runs
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
