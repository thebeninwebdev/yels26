import "server-only";
import QRCode from "qrcode";
import { getResend } from "./resend";
import { registrationTicketHtml, registrationTicketText } from "./templates/registration-ticket";
import type { EventSelectionStatus } from "@/lib/admin/event-selection-policy";

type SendRegistrationTicketInput = {
  email: string;
  fullName: string;
  registrationId: string;
  bootcampApplied: boolean;
  bootcampStatus: "not_applied" | "pending" | "approved" | "rejected" | "waitlisted";
  selectionStatus: EventSelectionStatus;
};

export async function generateRegistrationQr(registrationId: string) {
  return QRCode.toBuffer(`YELS26:${registrationId}`, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 600,
    type: "png",
  });
}

export async function sendRegistrationTicket(input: SendRegistrationTicketInput, qr: Buffer) {
  if (input.selectionStatus !== "selected") throw new Error("Event tickets can only be sent to selected participants");
  const { client, from } = getResend();
  const { data, error } = await client.emails.send({
    from,
    to: [input.email],
    subject: "Congratulations — You’ve Been Selected for YELS 2026",
    html: registrationTicketHtml(input),
    text: registrationTicketText(input),
    attachments: [{ filename: `yels26-${input.registrationId}-qr.png`, content: qr, contentId: "yels-ticket-qr" }],
  }, { idempotencyKey: `yels26-selected-ticket/${input.registrationId}` });

  if (error) {
    const failure = new Error(error.message || "Resend could not send the ticket email") as Error & { statusCode?: number };
    failure.name = error.name;
    failure.statusCode = error.statusCode ?? undefined;
    throw failure;
  }
  return { id: data?.id };
}
