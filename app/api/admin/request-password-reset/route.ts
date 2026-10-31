import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { ensureBetterAuthAdmin } from "@/lib/admin/migration";
const schema = z.object({ email: z.string().email().max(254), redirectTo: z.string().url() });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 }); const admin = await ensureBetterAuthAdmin(parsed.data.email); if (admin) { try { await auth.api.requestPasswordReset({ headers: request.headers, body: parsed.data }); } catch {} } return NextResponse.json({ ok: true }); }
