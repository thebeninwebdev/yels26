import "server-only";
import { event } from "@/app/event";

export type BootcampOutcomeStatus = "approved" | "waitlisted" | "rejected";
type Data = { fullName: string; status: BootcampOutcomeStatus };
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || fullName;

const copy = (status: BootcampOutcomeStatus) => status === "approved" ? {
  subject: "You’ve Been Selected for the YELS 2026 Bootcamp",
  heading: "You have been selected for the YELS 2026 Bootcamp.",
  body: "We are pleased to confirm your place for two days of learning, collaboration and practical development.",
} : status === "waitlisted" ? {
  subject: "Your YELS 2026 Bootcamp Application Update",
  heading: "Your Bootcamp application is on the waitlist.",
  body: "We will contact you if a Bootcamp place becomes available. Your place at the main YELS 2026 event remains confirmed.",
} : {
  subject: "Your YELS 2026 Bootcamp Application Update",
  heading: "An update on your Bootcamp application.",
  body: "Your application was not selected for the limited YELS 2026 Bootcamp. This does not affect your confirmed place at the main YELS 2026 event.",
};

export const bootcampOutcomeSubject = (status: BootcampOutcomeStatus) => copy(status).subject;

export function bootcampSelectionHtml({ fullName, status }: Data) {
  const content = copy(status);
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef8fa;color:#111111"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#fff;border:1px solid #dfe8ea;border-radius:18px;overflow:hidden"><tr><td style="padding:32px 30px 10px"><p style="margin:0 0 6px;font:700 25px/1 Arial,sans-serif">YELS 2026</p><p style="margin:0;color:#6b6b6b;font:600 10px/1.4 Arial,sans-serif;letter-spacing:1.2px">YOUTH EMPOWERMENT &amp; LEADERSHIP SUMMIT</p></td></tr><tr><td style="padding:22px 30px 30px"><h1 style="margin:0 0 16px;font:700 28px/1.2 Arial,sans-serif">Hello, ${escapeHtml(firstName(fullName))}.</h1><p style="margin:0 0 16px;color:#222;font:700 17px/1.5 Arial,sans-serif">${content.heading}</p><p style="margin:0 0 22px;color:#555;font:15px/1.6 Arial,sans-serif">${content.body}</p><div style="border:1px solid #dfe3e4;border-radius:12px;background:#fafcfc;padding:20px"><p style="margin:0 0 14px;font:700 13px/1.4 Arial,sans-serif;letter-spacing:.8px">BOOTCAMP DETAILS</p><p style="margin:0;color:#555;font:14px/1.65 Arial,sans-serif"><strong style="color:#111">${escapeHtml(event.bootcamp.dates)}</strong><br>${escapeHtml(event.bootcamp.time)}<br>${escapeHtml(event.location)}<br>Venue: ${escapeHtml(event.venue)}</p></div><p style="margin:22px 0 0;color:#555;font:15px/1.6 Arial,sans-serif">YELS 2026 Team</p></td></tr></table></td></tr></table></body></html>`;
}

export function bootcampSelectionText({ fullName, status }: Data) {
  const content = copy(status);
  return `YELS 2026\n\nHello, ${firstName(fullName)}.\n\n${content.heading}\n\n${content.body}\n\nBOOTCAMP DETAILS\n${event.bootcamp.dates}\n${event.bootcamp.time}\n${event.location}\nVenue: ${event.venue}\n\nYELS 2026 Team`;
}
