import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { changeEventSelection, EventSelectionError } from "@/lib/admin/event-selection-mutations";
import { eventSelectionStatuses } from "@/lib/admin/event-selection-policy";

const schema = z.object({ status: z.enum(eventSelectionStatuses) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event selection decision." }, { status: 400 });
  try {
    const result = await changeEventSelection({ attendeeIds: [id], status: parsed.data.status, adminId: admin.id });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof EventSelectionError) return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    console.error("Event selection update failed", error);
    return NextResponse.json({ error: "Event selection could not be updated." }, { status: 500 });
  }
}
