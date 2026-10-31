import "server-only";
import { getResend } from "./resend";
import { bootcampOutcomeSubject, bootcampSelectionHtml, bootcampSelectionText, type BootcampOutcomeStatus } from "./templates/bootcamp-selection";

export async function sendBootcampSelection(input: { email: string; fullName: string; registrationId: string; status: BootcampOutcomeStatus; idempotencyKey: string }) {
  const { client, from } = getResend();
  const { data, error } = await client.emails.send({
    from,
    to: [input.email],
    subject: bootcampOutcomeSubject(input.status),
    html: bootcampSelectionHtml(input),
    text: bootcampSelectionText(input),
  }, { idempotencyKey: input.idempotencyKey });
  if (error) throw new Error(error.message || "Resend could not send the Bootcamp outcome email");
  return { id: data?.id };
}
