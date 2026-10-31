import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureBetterAuthAdmin } from "@/lib/admin/migration";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const admin = await ensureBetterAuthAdmin(parsed.data.email);
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
