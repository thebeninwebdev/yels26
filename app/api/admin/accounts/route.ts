import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/admin";
const schema = z.object({ fullName: z.string().trim().min(1).max(120), email: z.string().email().max(254), password: z.string().min(10).max(128) });
export async function POST(request: Request) {
  if (process.env.ADMIN_CREATION_ENABLED !== "true" || request.headers.get("authorization") !== `Bearer ${process.env.ADMIN_CREATION_SECRET}`) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid account details." }, { status: 400 });
  await connectToDatabase();
  try {
    await Admin.create({ fullName: parsed.data.fullName, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12) });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return NextResponse.json({ error: "Account already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
