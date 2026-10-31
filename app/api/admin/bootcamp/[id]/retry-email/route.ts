import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { sendBootcampSelection } from "@/lib/email/send-bootcamp-selection";
import type { BootcampOutcomeStatus } from "@/lib/email/templates/bootcamp-selection";

export async function POST(_request: Request, context: RouteContext<"/api/admin/bootcamp/[id]/retry-email">) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid attendee ID." }, { status: 400 });
  await connectToDatabase();
  const attendee = await Attendee.findOne({ _id: id, registrationStatus: "registered", bootcampApplied: true, bootcampStatus: { $in: ["approved", "waitlisted", "rejected"] } });
  if (!attendee) return NextResponse.json({ error: "Bootcamp applicant not found." }, { status: 404 });
  if (attendee.ticketEmail?.status !== "sent") return NextResponse.json({ error: "The Bootcamp outcome will be included in the unsent final YELS email." }, { status: 409 });
  if (attendee.ticketEmail?.bootcampStatusIncluded === attendee.bootcampStatus) return NextResponse.json({ error: "This Bootcamp outcome was already included in the final YELS email." }, { status: 409 });
  if (attendee.bootcampSelectionEmail?.status === "sent" && attendee.bootcampSelectionEmail?.outcome === attendee.bootcampStatus) return NextResponse.json({ error: "Outcome email has already been sent." }, { status: 409 });

  const status = attendee.bootcampStatus as BootcampOutcomeStatus;
  const idempotencyKey = attendee.bootcampSelectionEmail?.idempotencyKey || `yels26-bootcamp-outcome/${attendee.registrationId}/${attendee.bootcampDecision?.decidedAt?.getTime() ?? Date.now()}`;
  await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.idempotencyKey": idempotencyKey, "bootcampSelectionEmail.lastAttemptAt": new Date(), "bootcampSelectionEmail.outcome": status }, $inc: { "bootcampSelectionEmail.attempts": 1 } });
  try {
    const sent = await sendBootcampSelection({ email: attendee.email, fullName: attendee.fullName, registrationId: attendee.registrationId, status, idempotencyKey });
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "sent", "bootcampSelectionEmail.sentAt": new Date(), "bootcampSelectionEmail.resendEmailId": sent.id }, $unset: { "bootcampSelectionEmail.lastError": 1 } });
    return NextResponse.json({ success: true, emailStatus: "sent" });
  } catch {
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "failed", "bootcampSelectionEmail.lastError": "Bootcamp outcome email delivery failed" } });
    return NextResponse.json({ success: false, emailStatus: "failed" }, { status: 502 });
  }
}
