import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { sendEmailBatch } from "@/lib/admin/event-selection-emails";

const schema = z.object({ mode: z.enum(["pending", "failed"]), attendeeId: z.string().optional() });

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email send request." }, { status: 400 });
  try {
    const result = await sendEmailBatch({ ...parsed.data, adminId: admin.id });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const known = error as Error & { status?: number; code?: string };
    if (known.status) return NextResponse.json({ error: known.message, code: known.code }, { status: known.status });
    console.error("Final selection email batch failed", error);
    return NextResponse.json({ error: "Final emails could not be processed." }, { status: 500 });
  }
}
