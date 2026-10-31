import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { EventSettings } from "@/lib/models/event-settings";
import { getResend } from "@/lib/email/resend";
import { generateRegistrationQr, sendRegistrationTicket } from "@/lib/email/send-registration-ticket";
import { ensureEventSettings } from "./event-settings";

export const EMAIL_BATCH_SIZE = 10;
export const EMAIL_CLAIM_STALE_MS = 10 * 60 * 1000;
export type TicketEmailStatus = "pending" | "sending" | "sent" | "failed";
export type EmailSendMode = "pending" | "failed";

export type EmailQuota = {
  available: boolean;
  used: number | null;
  limit: number | null;
  remaining: number | null;
  resetsAt: string | null;
  error?: string;
};

export type FailedEmailRecipient = {
  id: string;
  fullName: string;
  email: string;
  registrationId: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError: string;
};

export type EmailDeliverySummary = {
  selected: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  ready: number;
  complete: boolean;
  failedRecipients: FailedEmailRecipient[];
};

type ClaimedAttendee = {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  registrationId: string;
  bootcampApplied: boolean;
  bootcampStatus: "not_applied" | "pending" | "approved" | "rejected" | "waitlisted";
};

const activeSelected = { registrationStatus: "registered", selectionStatus: "selected" } as const;
const staleBefore = () => new Date(Date.now() - EMAIL_CLAIM_STALE_MS);
const pendingCondition = () => ({
  $or: [
    { "ticketEmail.status": "pending" },
    { "ticketEmail.status": { $exists: false } },
    { "ticketEmail.status": "sending", "ticketEmail.claimedAt": { $lt: staleBefore() } },
  ],
});

export async function getEmailQuota(): Promise<EmailQuota> {
  try {
    const { client } = getResend();
    const { data, error } = await client.usage.get();
    if (error || !data) throw new Error(error?.message || "Usage data was not returned");
    const daily = data.emails.daily;
    return {
      available: true,
      used: daily.used,
      limit: daily.limit,
      remaining: daily.limit === null ? null : Math.max(0, daily.limit - daily.used),
      resetsAt: daily.resets_at,
    };
  } catch {
    return { available: false, used: null, limit: null, remaining: null, resetsAt: null, error: "Email quota information unavailable." };
  }
}

export async function getEmailDeliverySummary(): Promise<EmailDeliverySummary> {
  await connectToDatabase();
  const stale = staleBefore();
  const [selected, pending, staleSending, sending, sent, failed, failedRows] = await Promise.all([
    Attendee.countDocuments(activeSelected),
    Attendee.countDocuments({ ...activeSelected, $or: [{ "ticketEmail.status": "pending" }, { "ticketEmail.status": { $exists: false } }] }),
    Attendee.countDocuments({ ...activeSelected, "ticketEmail.status": "sending", "ticketEmail.claimedAt": { $lt: stale } }),
    Attendee.countDocuments({ ...activeSelected, "ticketEmail.status": "sending", "ticketEmail.claimedAt": { $gte: stale } }),
    Attendee.countDocuments({ ...activeSelected, "ticketEmail.status": "sent" }),
    Attendee.countDocuments({ ...activeSelected, "ticketEmail.status": "failed" }),
    Attendee.find({ ...activeSelected, "ticketEmail.status": "failed" }).select("fullName email registrationId ticketEmail").sort({ "ticketEmail.lastAttemptAt": -1 }).limit(100).lean(),
  ]);
  const ready = pending + staleSending;
  const complete = selected > 0 && sent === selected;
  await EventSettings.updateOne(
    { key: "event" },
    complete ? { $set: { selectionEmailsCompletedAt: new Date() } } : { $unset: { selectionEmailsCompletedAt: 1 } },
  );
  return {
    selected, pending: ready, sending, sent, failed, ready, complete,
    failedRecipients: failedRows.map((row) => ({
      id: row._id.toString(),
      fullName: row.fullName,
      email: row.email,
      registrationId: row.registrationId,
      attempts: row.ticketEmail?.attempts ?? 0,
      lastAttemptAt: row.ticketEmail?.lastAttemptAt?.toISOString(),
      lastError: row.ticketEmail?.lastError || "Final email delivery failed",
    })),
  };
}

async function claimNext(mode: EmailSendMode, attendeeId?: string) {
  const statusCondition = mode === "failed" ? { "ticketEmail.status": "failed" } : pendingCondition();
  const query = attendeeId
    ? { ...activeSelected, _id: new Types.ObjectId(attendeeId), ...statusCondition }
    : { ...activeSelected, ...statusCondition };
  const now = new Date();
  return Attendee.findOneAndUpdate(
    query,
    {
      $set: { "ticketEmail.status": "sending", "ticketEmail.claimedAt": now, "ticketEmail.lastAttemptAt": now },
      $inc: { "ticketEmail.attempts": 1 },
      $unset: { "ticketEmail.lastError": 1 },
    },
    { new: true, sort: { createdAt: 1 } },
  ).lean() as Promise<ClaimedAttendee | null>;
}

const safeDeliveryError = (error: unknown) => {
  if (error instanceof Error && error.message === "YELS ticket email is not configured") return error.message;
  if ((error as { statusCode?: number }).statusCode === 429) return "Email provider rate limit reached";
  return "Final email delivery failed";
};

export async function sendEmailBatch(input: { mode: EmailSendMode; adminId: string; attendeeId?: string }) {
  await connectToDatabase();
  const settings = await ensureEventSettings();
  if (!settings.selectionFinalized) {
    const error = new Error("Event selection must be finalized before emails can be sent.") as Error & { code?: string; status?: number };
    error.code = "SELECTION_NOT_FINALIZED";
    error.status = 409;
    throw error;
  }
  if (input.attendeeId && !Types.ObjectId.isValid(input.attendeeId)) {
    const error = new Error("Invalid attendee ID.") as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const quota = await getEmailQuota();
  const quotaCapacity = quota.remaining === null ? EMAIL_BATCH_SIZE : Math.min(EMAIL_BATCH_SIZE, quota.remaining);
  const batchLimit = input.attendeeId ? Math.min(1, quotaCapacity) : quotaCapacity;
  if (batchLimit === 0) return { batch: { attempted: 0, sent: 0, failed: 0 }, summary: await getEmailDeliverySummary(), quota, quotaExhausted: true, rateLimited: false };

  await EventSettings.updateOne(
    { key: "event", selectionEmailsStartedAt: { $exists: false } },
    { $set: { selectionEmailsStartedAt: new Date(), selectionEmailsStartedBy: new Types.ObjectId(input.adminId) } },
  );

  let attempted = 0;
  let sent = 0;
  let failed = 0;
  let rateLimited = false;
  for (let index = 0; index < batchLimit; index += 1) {
    const attendee = await claimNext(input.mode, input.attendeeId);
    if (!attendee) break;
    attempted += 1;
    try {
      const qr = await generateRegistrationQr(attendee.registrationId);
      const result = await sendRegistrationTicket({
        email: attendee.email,
        fullName: attendee.fullName,
        registrationId: attendee.registrationId,
        bootcampApplied: attendee.bootcampApplied,
        bootcampStatus: attendee.bootcampStatus,
        selectionStatus: "selected",
      }, qr);
      await Attendee.updateOne(
        { _id: attendee._id, "ticketEmail.status": "sending" },
        {
          $set: { "ticketEmail.status": "sent", "ticketEmail.sentAt": new Date(), "ticketEmail.resendEmailId": result.id, "ticketEmail.bootcampStatusIncluded": attendee.bootcampStatus },
          $unset: { "ticketEmail.claimedAt": 1, "ticketEmail.lastError": 1 },
        },
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      rateLimited = (error as { statusCode?: number }).statusCode === 429;
      await Attendee.updateOne(
        { _id: attendee._id, "ticketEmail.status": "sending" },
        { $set: { "ticketEmail.status": "failed", "ticketEmail.lastError": safeDeliveryError(error) }, $unset: { "ticketEmail.claimedAt": 1 } },
      );
      if (rateLimited) break;
    }
    if (input.attendeeId) break;
  }

  const summary = await getEmailDeliverySummary();
  const updatedQuota = quota.available ? await getEmailQuota() : quota;
  return {
    batch: { attempted, sent, failed },
    summary,
    quota: updatedQuota,
    quotaExhausted: updatedQuota.remaining === 0 && summary.ready > 0,
    rateLimited,
  };
}
