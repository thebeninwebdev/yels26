import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { sendBootcampSelection } from "@/lib/email/send-bootcamp-selection";

const bodySchema = z.object({ status: z.enum(["approved", "rejected", "waitlisted"]) });
const safeError = (error: unknown) => error instanceof Error && error.message === "YELS ticket email is not configured" ? error.message : "Bootcamp outcome email delivery failed";

export async function POST(request: Request, context: RouteContext<"/api/admin/bootcamp/[id]/decision">) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid attendee ID." }, { status: 400 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid Bootcamp decision." }, { status: 400 });

  await connectToDatabase();
  const attendee = await Attendee.findOne({ _id: id, registrationStatus: "registered", bootcampApplied: true });
  if (!attendee) return NextResponse.json({ error: "Bootcamp applicant not found." }, { status: 404 });
  const now = new Date();
  attendee.bootcampStatus = parsed.data.status;
  attendee.bootcampDecision = { decidedAt: now, decidedBy: new Types.ObjectId(admin.id) };
  await attendee.save();

  const includedInTicket = attendee.ticketEmail?.status === "sent" && attendee.ticketEmail?.bootcampStatusIncluded === parsed.data.status;
  if (attendee.ticketEmail?.status !== "sent" || includedInTicket) {
    return NextResponse.json({ success: true, emailStatus: "pending", communication: includedInTicket ? "included" : "final_email" });
  }

  const idempotencyKey = `yels26-bootcamp-outcome/${attendee.registrationId}/${now.getTime()}`;
  await Attendee.updateOne({ _id: attendee._id }, {
    $set: {
      "bootcampSelectionEmail.status": "pending",
      "bootcampSelectionEmail.outcome": parsed.data.status,
      "bootcampSelectionEmail.idempotencyKey": idempotencyKey,
      "bootcampSelectionEmail.lastAttemptAt": now,
    },
    $inc: { "bootcampSelectionEmail.attempts": 1 },
    $unset: { "bootcampSelectionEmail.lastError": 1 },
  });
  try {
    const sent = await sendBootcampSelection({ email: attendee.email, fullName: attendee.fullName, registrationId: attendee.registrationId, status: parsed.data.status, idempotencyKey });
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "sent", "bootcampSelectionEmail.sentAt": new Date(), "bootcampSelectionEmail.resendEmailId": sent.id }, $unset: { "bootcampSelectionEmail.lastError": 1 } });
    return NextResponse.json({ success: true, emailStatus: "sent", communication: "standalone" });
  } catch (error) {
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "failed", "bootcampSelectionEmail.lastError": safeError(error) } });
    return NextResponse.json({ success: true, emailStatus: "failed", communication: "standalone" });
  }
}
