import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { sendBootcampSelection } from "@/lib/email/send-bootcamp-selection";

const bodySchema = z.object({ status: z.enum(["approved", "rejected", "waitlisted"]) });
const safeError = (error: unknown) => error instanceof Error && error.message === "YELS ticket email is not configured" ? error.message : "Selection email delivery failed";

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
  const wasApproved = attendee.bootcampStatus === "approved";
  attendee.bootcampStatus = parsed.data.status;
  attendee.bootcampDecision = { decidedAt: new Date(), decidedBy: new Types.ObjectId(admin.id) };
  await attendee.save();
  if (parsed.data.status !== "approved" || wasApproved) return NextResponse.json({ success: true, emailStatus: attendee.bootcampSelectionEmail?.status ?? "pending" });
  try {
    const sent = await sendBootcampSelection({ email: attendee.email, fullName: attendee.fullName });
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "sent", "bootcampSelectionEmail.sentAt": new Date(), "bootcampSelectionEmail.resendEmailId": sent.id }, $unset: { "bootcampSelectionEmail.lastError": 1 } });
    return NextResponse.json({ success: true, emailStatus: "sent" });
  } catch (error) {
    await Attendee.updateOne({ _id: attendee._id }, { $set: { "bootcampSelectionEmail.status": "failed", "bootcampSelectionEmail.lastError": safeError(error) } });
    return NextResponse.json({ success: true, emailStatus: "failed" });
  }
}
