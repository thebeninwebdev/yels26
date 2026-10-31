import { randomUUID } from "node:crypto";
import { getAuthDatabase } from "@/lib/better-auth-db";
import { Admin } from "@/lib/models/admin";
import { connectToDatabase } from "@/lib/mongodb";

export async function ensureBetterAuthAdmin(email: string) {
  await connectToDatabase();
  const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash fullName email status").lean();
  if (!admin || admin.status !== "active") return null;
  const db = getAuthDatabase();
  const users = db.collection("user");
  const accounts = db.collection("account");
  const existing = await users.findOne({ email: admin.email });
  if (!existing) {
    const id = randomUUID();
    const now = new Date();
    await users.insertOne({ id, name: admin.fullName, email: admin.email, emailVerified: true, createdAt: now, updatedAt: now });
    await accounts.insertOne({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: admin.passwordHash, createdAt: now, updatedAt: now });
  }
  return admin;
}
