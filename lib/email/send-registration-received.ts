import "server-only";
import { getResend } from "./resend";
import { registrationReceivedHtml, registrationReceivedText } from "./templates/registration-received";

type RegistrationReceivedInput = { email: string; fullName: string; bootcampApplied: boolean };

export async function sendRegistrationReceived(input: RegistrationReceivedInput) {
  const { client, from } = getResend();
  const { data, error } = await client.emails.send({
    from,
    to: [input.email],
    subject: "YELS 2026 Registration Received",
    html: registrationReceivedHtml(input),
    text: registrationReceivedText(input),
  });
  if (error) throw new Error(error.message || "Resend could not send the registration acknowledgement");
  return { id: data?.id };
}
