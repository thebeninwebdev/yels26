import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { registrationSchema } from "@/app/register/schema";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { generateRegistrationQr, sendRegistrationTicket } from "@/lib/email/send-registration-ticket";

function registrationId() {
  return `YELS26-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const data = parsed.data;
    const email = data.email.toLowerCase();
    if (await Attendee.exists({ email })) {
      return NextResponse.json(
        { error: "It looks like you’ve already registered for YELS 2026.", code: "DUPLICATE_EMAIL" },
        { status: 409 },
      );
    }

    let id = registrationId();
    while (await Attendee.exists({ registrationId: id })) id = registrationId();
    const applyingForBootcamp = data.bootcampApplied === "yes";
    const attendee = await Attendee.create({
      ...data,
      email,
      bootcampApplied: applyingForBootcamp,
      bootcampApplication: applyingForBootcamp
        ? {
            reason: data.bootcampReason,
            primaryInterest: data.bootcampPrimaryInterest,
            primaryInterestOther: data.bootcampPrimaryInterestOther,
            currentWork: data.bootcampCurrentWork,
            challenge: data.bootcampChallenge,
            previousProgramme: data.previousProgramme,
            previousProgrammeDetails: data.previousProgrammeDetails,
            availableBothDays: data.availableBothDays,
          }
        : undefined,
      registrationStatus: "registered",
      bootcampStatus: applyingForBootcamp ? "pending" : "not_applied",
      registrationId: id,
    });

    let ticketEmailSent = false;
    let qrCodeDataUrl: string | undefined;
    try {
      const qr = await generateRegistrationQr(id);
      qrCodeDataUrl = `data:image/png;base64,${qr.toString("base64")}`;
      const ticket = await sendRegistrationTicket({ email, fullName: data.fullName, registrationId: id, bootcampApplied: applyingForBootcamp }, qr);
      ticketEmailSent = true;
      try {
        await Attendee.updateOne(
          { _id: attendee._id },
          { $set: { "ticketEmail.status": "sent", "ticketEmail.sentAt": new Date(), "ticketEmail.resendEmailId": ticket.id } },
        );
      } catch (trackingError) {
        console.error("YELS ticket email status update failed", trackingError);
      }
    } catch (error) {
      console.error("YELS ticket email failed", error);
      const lastError = error instanceof Error && error.message === "YELS ticket email is not configured"
        ? error.message
        : "Ticket delivery failed";
      try {
        await Attendee.updateOne(
          { _id: attendee._id },
          { $set: { "ticketEmail.status": "failed", "ticketEmail.lastError": lastError } },
        );
      } catch (trackingError) {
        console.error("YELS ticket email failure update failed", trackingError);
      }
    }

    return NextResponse.json({ registrationId: id, fullName: data.fullName, bootcampApplied: applyingForBootcamp, ticketEmailSent, qrCodeDataUrl }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "It looks like you’ve already registered for YELS 2026.", code: "DUPLICATE_EMAIL" },
        { status: 409 },
      );
    }
    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "We couldn’t complete your registration right now. Please try again shortly." },
      { status: 503 },
    );
  }
}
