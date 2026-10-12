import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { clearAdminSession, getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/admin";
const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(10).max(128), confirmPassword: z.string().min(1).max(128) });
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.newPassword !== parsed.data.confirmPassword) return NextResponse.json({ error: "Please check the password fields." }, { status: 400 });
  await connectToDatabase();
  const admin = await Admin.findById(session.id).select("+passwordHash sessionVersion");
  if (!admin || !(await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash))) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  if (await bcrypt.compare(parsed.data.newPassword, admin.passwordHash)) return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  admin.sessionVersion += 1;
  await admin.save();
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
