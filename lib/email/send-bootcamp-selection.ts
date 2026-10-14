import "server-only";
import { getResend } from "./resend";
import { bootcampSelectionHtml, bootcampSelectionText } from "./templates/bootcamp-selection";

export async function sendBootcampSelection(input: { email: string; fullName: string }) {
  const { client, from } = getResend();
  const { data, error } = await client.emails.send({ from, to: [input.email], subject: "Congratulations — You’ve Been Selected for the YELS 2026 Bootcamp", html: bootcampSelectionHtml(input), text: bootcampSelectionText(input) });
  if (error) throw new Error(error.message || "Resend could not send the Bootcamp selection email");
  return { id: data?.id };
}
