import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { sendCheckInConfirmation } from "@/lib/email/send-check-in-confirmation";

const registrationIdPattern = /^YELS26-[A-F0-9]{8}$/;
const bodySchema = z.object({ qrPayload: z.string().max(100).optional(), registrationId: z.string().max(32).optional(), action: z.enum(["verify", "check-in"]).default("check-in") }).refine((value) => Boolean(value.qrPayload || value.registrationId));
const publicAttendee = (attendee: { _id: { toString(): string }; registrationId: string; fullName: string; email: string; participantType: string; selectionStatus: string; bootcampApplied: boolean; bootcampStatus: string; checkIn?: { checkedInAt?: Date } }) => ({ id: attendee._id.toString(), registrationId: attendee.registrationId, fullName: attendee.fullName, email: attendee.email, participantType: attendee.participantType, selectionStatus: attendee.selectionStatus, bootcampApplied: attendee.bootcampApplied, bootcampStatus: attendee.bootcampStatus, checkedInAt: attendee.checkIn?.checkedInAt?.toISOString() });

function ticketId(input: { qrPayload?: string; registrationId?: string }) {
  if (input.qrPayload) { if (!input.qrPayload.startsWith("YELS26:")) return null; return input.qrPayload.slice(input.qrPayload.indexOf(":") + 1).trim().toUpperCase(); }
  return input.registrationId?.trim().toUpperCase() ?? null;
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid YELS ticket.", code: "INVALID_TICKET" }, { status: 400 });
    const registrationId = ticketId(parsed.data);
    if (!registrationId || !registrationIdPattern.test(registrationId)) return NextResponse.json({ error: "Invalid YELS ticket.", code: "INVALID_TICKET" }, { status: 400 });
    await connectToDatabase();
    if (parsed.data.action === "verify") {
      const attendee = await Attendee.findOne({ registrationId }).select("registrationId fullName email participantType selectionStatus bootcampApplied bootcampStatus registrationStatus checkIn").lean();
      if (!attendee) return NextResponse.json({ error: "Ticket not found.", code: "TICKET_NOT_FOUND" }, { status: 404 });
      if (attendee.registrationStatus === "cancelled") return NextResponse.json({ error: "This registration has been cancelled.", code: "REGISTRATION_CANCELLED" }, { status: 409 });
      if (attendee.selectionStatus !== "selected") return NextResponse.json({ error: "Registration found, but this participant was not selected for the event.", code: "NOT_SELECTED_FOR_EVENT" }, { status: 403 });
      if (attendee.checkIn?.status === "checked_in") return NextResponse.json({ error: "Attendee already checked in.", code: "ALREADY_CHECKED_IN", attendee: publicAttendee(attendee) }, { status: 409 });
      return NextResponse.json({ success: true, attendee: publicAttendee(attendee) });
    }
    const attendee = await Attendee.findOneAndUpdate({ registrationId, registrationStatus: "registered", selectionStatus: "selected", "checkIn.status": "not_checked_in" }, { $set: { "checkIn.status": "checked_in", "checkIn.checkedInAt": new Date() } }, { new: true }).select("registrationId fullName email participantType selectionStatus bootcampApplied bootcampStatus checkIn").lean();
    if (attendee) {
      try {
        await sendCheckInConfirmation({ email: attendee.email, fullName: attendee.fullName, registrationId: attendee.registrationId, checkedInAt: attendee.checkIn?.checkedInAt });
      } catch (error) {
        console.error("YELS check-in confirmation email failed", error);
      }
      return NextResponse.json({ success: true, attendee: publicAttendee(attendee) });
    }
    const existing = await Attendee.findOne({ registrationId }).select("registrationId fullName email participantType selectionStatus bootcampApplied bootcampStatus registrationStatus checkIn").lean();
    if (!existing) return NextResponse.json({ error: "Ticket not found.", code: "TICKET_NOT_FOUND" }, { status: 404 });
    if (existing.registrationStatus === "cancelled") return NextResponse.json({ error: "This registration has been cancelled.", code: "REGISTRATION_CANCELLED", attendee: publicAttendee(existing) }, { status: 409 });
    if (existing.selectionStatus !== "selected") return NextResponse.json({ error: "Registration found, but this participant was not selected for the event.", code: "NOT_SELECTED_FOR_EVENT" }, { status: 403 });
    return NextResponse.json({ error: "Attendee already checked in.", code: "ALREADY_CHECKED_IN", attendee: publicAttendee(existing) }, { status: 409 });
  } catch (error) {
    console.error("Admin check-in failed", error);
    return NextResponse.json({ error: "Check-in is temporarily unavailable.", code: "CHECK_IN_UNAVAILABLE" }, { status: 503 });
  }
}
