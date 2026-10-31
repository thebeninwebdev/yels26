import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { MAX_EVENT_CAPACITY } from "@/lib/admin/event-selection-policy";
import { ensureEventSettings, getEventSettings } from "@/lib/admin/event-settings";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { EventSettings } from "@/lib/models/event-settings";

const schema = z.object({ eventCapacity: z.number().int().min(1).max(MAX_EVENT_CAPACITY) });

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const [settings, selected] = await Promise.all([
    getEventSettings(),
    Attendee.countDocuments({ registrationStatus: "registered", selectionStatus: "selected" }),
  ]);
  return NextResponse.json({ ...settings, selected });
}

export async function PATCH(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Event capacity must be a whole number between 1 and ${MAX_EVENT_CAPACITY.toLocaleString()}.` }, { status: 400 });
  await connectToDatabase();
  await ensureEventSettings();
  const settings = await EventSettings.findOneAndUpdate({ key: "event" }, { $set: { eventCapacity: parsed.data.eventCapacity } }, { new: true });
  const selected = await Attendee.countDocuments({ registrationStatus: "registered", selectionStatus: "selected" });
  return NextResponse.json({ eventCapacity: settings?.eventCapacity ?? parsed.data.eventCapacity, selected, overCapacity: Math.max(0, selected - parsed.data.eventCapacity) });
}
