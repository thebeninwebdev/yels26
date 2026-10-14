import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { sendBootcampSelection } from "@/lib/email/send-bootcamp-selection";

export async function POST(_request: Request, context: RouteContext<"/api/admin/bootcamp/[id]/retry-email">) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid attendee ID." }, { status: 400 });
  await connectToDatabase();
  const attendee = await Attendee.findOne({ _id: id, registrationStatus: "registered", bootcampApplied: true, bootcampStatus: "approved" });
  if (!attendee) return NextResponse.json({ error: "Selected Bootcamp applicant not found." }, { status: 404 });
  if (attendee.bootcampSelectionEmail?.status === "sent") return NextResponse.json({ error: "Selection email has already been sent." }, { status: 409 });
  try {
    const sent = await sendBootcampSelection({ email: attendee.email, fullName: attendee.fullName });
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "sent", "bootcampSelectionEmail.sentAt": new Date(), "bootcampSelectionEmail.resendEmailId": sent.id }, $unset: { "bootcampSelectionEmail.lastError": 1 } });
    return NextResponse.json({ success: true, emailStatus: "sent" });
  } catch {
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "failed", "bootcampSelectionEmail.lastError": "Selection email delivery failed" } });
    return NextResponse.json({ success: false, emailStatus: "failed" }, { status: 502 });
  }
}
