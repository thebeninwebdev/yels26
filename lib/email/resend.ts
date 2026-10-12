import "server-only";
import { Resend } from "resend";

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.RESEND_FROM_NAME || process.env.EMAIL_FROM_NAME;

  if (!apiKey || !fromEmail || !fromName) {
    throw new Error("YELS ticket email is not configured");
  }

  return { client: new Resend(apiKey), from: `${fromName} <${fromEmail}>` };
}
