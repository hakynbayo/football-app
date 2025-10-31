import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userId = await registerUser(name, email, password);

    return NextResponse.json({ success: true, userId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
