import "server-only";
import QRCode from "qrcode";
import { getResend } from "./resend";
import { registrationTicketHtml, registrationTicketText } from "./templates/registration-ticket";

type SendRegistrationTicketInput = {
  email: string;
  fullName: string;
  registrationId: string;
  bootcampApplied: boolean;
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
  const { client, from } = getResend();
  const { data, error } = await client.emails.send({
    from,
    to: [input.email],
    subject: `Your YELS 2026 Ticket — ${input.registrationId}`,
    html: registrationTicketHtml(input),
    text: registrationTicketText(input),
    attachments: [{ filename: `yels26-${input.registrationId}-qr.png`, content: qr, contentId: "yels-ticket-qr" }],
  });

  if (error) throw new Error(error.message || "Resend could not send the ticket email");
  return { id: data?.id };
}
