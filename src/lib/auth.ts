import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "minecraft-pvp-secret-key-2026";

export interface AdminPayload {
  id: string;
  username: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

function getTokenFromRequest(request: Request): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.split(";").find((c) => c.trim().startsWith("admin_token="));
    if (match) return match.trim().substring("admin_token=".length);
  }
  return undefined;
}

export async function getAuthFromCookies(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (token) return verifyToken(token);
  } catch {}
  return null;
}

export function getAuthFromRequest(request: Request): AdminPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<AdminPayload> {
  const admin = await getAuthFromCookies();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export function requireAdminFromRequest(request: Request): AdminPayload {
  const admin = getAuthFromRequest(request);
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
