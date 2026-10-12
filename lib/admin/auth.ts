import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/admin";

const COOKIE_NAME = "yels_admin_session";
const MAX_AGE = 60 * 60 * 8;
type SessionPayload = { adminId: string; sessionVersion: number };

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return new TextEncoder().encode(value);
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.adminId !== "string" || typeof payload.sessionVersion !== "number") return null;
    return { adminId: payload.adminId, sessionVersion: payload.sessionVersion };
  } catch {
    return null;
  }
}

export async function createAdminSession(admin: { _id: { toString(): string }; sessionVersion: number }) {
  const token = await new SignJWT({ adminId: admin._id.toString(), sessionVersion: admin.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE_NAME, token, cookieOptions);
}

export async function clearAdminSession() {
  (await cookies()).set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

export async function getAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  await connectToDatabase();
  const admin = await Admin.findById(payload.adminId).select("fullName email role status sessionVersion").lean();
  if (!admin || admin.status !== "active" || admin.sessionVersion !== payload.sessionVersion) return null;
  return { id: admin._id.toString(), fullName: admin.fullName, email: admin.email, role: admin.role, sessionVersion: admin.sessionVersion };
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
