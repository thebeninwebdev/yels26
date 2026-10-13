import "server-only";
import { event } from "@/app/event";
import { getResend } from "./resend";

type CheckInConfirmationInput = { email: string; fullName: string; registrationId: string; checkedInAt?: Date };

export async function sendCheckInConfirmation({ email, fullName, registrationId, checkedInAt }: CheckInConfirmationInput) {
  const { client, from } = getResend();
  const checkedInTime = checkedInAt ? checkedInAt.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" }) : "just now";
  const html = `<!doctype html><html><body style="margin:0;background:#eef8fa;color:#111;font:15px/1.6 Arial,sans-serif"><main style="max-width:620px;margin:0 auto;padding:32px 20px"><section style="background:#fff;border:1px solid #dfe8ea;border-radius:16px;padding:30px"><p style="margin:0 0 12px;color:#0a8f63;font:700 11px/1.4 Arial,sans-serif;letter-spacing:1.2px">YELS 2026 · CHECK-IN CONFIRMED</p><h1 style="margin:0 0 12px;font:700 28px/1.2 Arial,sans-serif">Welcome, ${escapeHtml(fullName)}.</h1><p style="margin:0 0 20px">You have been checked in for ${escapeHtml(event.name)} at ${escapeHtml(event.location)}.</p><div style="border-left:3px solid #0aee99;background:#f4fffb;padding:14px 16px"><strong style="display:block">Checked in at ${escapeHtml(checkedInTime)}</strong><span>Registration ID: ${escapeHtml(registrationId)}</span></div><p style="margin:22px 0 0;color:#555">Enjoy the summit.</p></section></main></body></html>`;
  const text = `YELS 2026 check-in confirmed\n\nWelcome, ${fullName}. You have been checked in for ${event.name}.\n\nVenue: ${event.location}\nChecked in at: ${checkedInTime}\nRegistration ID: ${registrationId}\n\nEnjoy the summit.`;
  const { data, error } = await client.emails.send({ from, to: [email], subject: "YELS 2026 check-in confirmed", html, text });
  if (error) throw new Error(error.message || "Resend could not send the check-in confirmation");
  return { id: data?.id };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
