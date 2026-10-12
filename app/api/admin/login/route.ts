import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/admin";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await connectToDatabase();
  const admin = await Admin.findOne({ email: parsed.data.email.trim().toLowerCase() }).select("+passwordHash fullName email status sessionVersion");
  if (!admin || admin.status !== "active" || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createAdminSession(admin);
  return NextResponse.json({ ok: true });
}
