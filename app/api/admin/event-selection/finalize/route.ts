import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { EventSelectionError, setEventSelectionFinalized } from "@/lib/admin/event-selection-mutations";

const schema = z.object({ action: z.enum(["finalize", "reopen"]) });

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid selection action." }, { status: 400 });
  try {
    const result = await setEventSelectionFinalized({ finalize: parsed.data.action === "finalize", adminId: admin.id });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof EventSelectionError) return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    console.error("Finalize event selection failed", error);
    return NextResponse.json({ error: "Selection status could not be changed." }, { status: 500 });
  }
}
