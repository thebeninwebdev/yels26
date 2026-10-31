import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin/auth";
const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(10).max(128), confirmPassword: z.string().min(1).max(128) });
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.newPassword !== parsed.data.confirmPassword) return NextResponse.json({ error: "Please check the password fields." }, { status: 400 });
  const result = await auth.api.changePassword({ headers: await headers(), body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true } });
  if (!result) return NextResponse.json({ error: "Unable to change password." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
