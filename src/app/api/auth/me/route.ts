import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = getAuthFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ username: admin.username });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
