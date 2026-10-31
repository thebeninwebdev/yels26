import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { changeEventSelection, EventSelectionError } from "@/lib/admin/event-selection-mutations";
import { eventSelectionStatuses } from "@/lib/admin/event-selection-policy";

const schema = z.object({ attendeeIds: z.array(z.string()).min(1).max(500), status: z.enum(eventSelectionStatuses) });

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose valid applicants and an event status." }, { status: 400 });
  try {
    const result = await changeEventSelection({ ...parsed.data, adminId: admin.id });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof EventSelectionError) return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    console.error("Bulk event selection update failed", error);
    return NextResponse.json({ error: "Event selections could not be updated." }, { status: 500 });
  }
}
