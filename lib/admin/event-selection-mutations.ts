import "server-only";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { EventSettings } from "@/lib/models/event-settings";
import { ensureEventSettings } from "./event-settings";
import {
  additionsForSelection,
  buildSelectionUpdate,
  canApproveAllPending,
  selectionCapacityError,
  type EventSelectionStatus,
} from "./event-selection-policy";

export class EventSelectionError extends Error {
  constructor(message: string, public status = 400, public details: Record<string, unknown> = {}) {
    super(message);
  }
}

type MutationResult = { matched: number; modified: number; status: EventSelectionStatus };

async function transaction<T>(work: (session: mongoose.ClientSession) => Promise<T>) {
  await connectToDatabase();
  const session = await mongoose.startSession();
  let result: T | undefined;
  try {
    await session.withTransaction(async () => { result = await work(session); });
    if (result === undefined) throw new Error("Event selection transaction did not complete.");
    return result;
  } finally {
    await session.endSession();
  }
}

async function lockedSettings(session: mongoose.ClientSession) {
  const settings = await ensureEventSettings({ session });
  await EventSettings.updateOne({ _id: settings._id }, { $set: { selectionUpdatedAt: new Date() }, $unset: { selectionEmailsCompletedAt: 1 } }, { session });
  if (settings.selectionFinalized) throw new EventSelectionError("Selections are finalized. Reopen selection before making changes.", 409, { code: "SELECTION_FINALIZED" });
  return settings;
}

export async function changeEventSelection(input: { attendeeIds: string[]; status: EventSelectionStatus; adminId: string }): Promise<MutationResult> {
  const uniqueIds = [...new Set(input.attendeeIds)];
  if (!uniqueIds.length || uniqueIds.some((id) => !Types.ObjectId.isValid(id))) throw new EventSelectionError("Select at least one valid attendee.");
  const ids = uniqueIds.map((id) => new Types.ObjectId(id));
  return transaction(async (session) => {
    const settings = await lockedSettings(session);
    const attendees = await Attendee.find({ _id: { $in: ids }, registrationStatus: "registered" }).select("selectionStatus").session(session).lean();
    if (attendees.length !== ids.length) throw new EventSelectionError("One or more registrations no longer exist or are cancelled.", 409);
    const selected = await Attendee.countDocuments({ registrationStatus: "registered", selectionStatus: "selected" }).session(session);
    const additions = additionsForSelection(attendees.map((attendee) => attendee.selectionStatus as EventSelectionStatus), input.status);
    const capacityError = selectionCapacityError(settings.eventCapacity, selected, additions);
    if (capacityError) throw new EventSelectionError(capacityError.error, 409, { code: "CAPACITY_EXCEEDED", ...capacityError });
    const now = new Date();
    const update = buildSelectionUpdate(input.status, new Types.ObjectId(input.adminId), now);
    const result = await Attendee.updateMany({ _id: { $in: ids }, registrationStatus: "registered" }, update, { session });
    return { matched: result.matchedCount, modified: result.modifiedCount, status: input.status };
  });
}

export async function approveAllPendingEventApplicants(adminId: string) {
  return transaction(async (session) => {
    const settings = await lockedSettings(session);
    const active = { registrationStatus: "registered" } as const;
    const [selected, pending] = await Promise.all([
      Attendee.countDocuments({ ...active, selectionStatus: "selected" }).session(session),
      Attendee.countDocuments({ ...active, selectionStatus: "pending" }).session(session),
    ]);
    const remaining = Math.max(0, settings.eventCapacity - selected);
    if (!canApproveAllPending(settings.eventCapacity, selected, pending)) {
      throw new EventSelectionError(
        `Event capacity changed. There are now only ${remaining} available places for ${pending} pending applicants.`,
        409,
        { code: "APPROVE_ALL_BLOCKED", capacity: settings.eventCapacity, selected, pending, availablePlaces: remaining },
      );
    }
    const result = await Attendee.updateMany(
      { ...active, selectionStatus: "pending" },
      buildSelectionUpdate("selected", new Types.ObjectId(adminId), new Date()),
      { session },
    );
    return { selected: result.modifiedCount, capacity: settings.eventCapacity };
  });
}

export async function setEventSelectionFinalized(input: { finalize: boolean; adminId: string }) {
  return transaction(async (session) => {
    const settings = await ensureEventSettings({ session });
    await EventSettings.updateOne({ _id: settings._id }, { $set: { selectionUpdatedAt: new Date() } }, { session });
    if (!input.finalize) {
      await EventSettings.updateOne(
        { _id: settings._id },
        { $set: { selectionFinalized: false }, $unset: { selectionFinalizedAt: 1, selectionFinalizedBy: 1, selectionEmailsCompletedAt: 1 } },
        { session },
      );
      return { selectionFinalized: false };
    }
    const active = { registrationStatus: "registered" } as const;
    const [selected, pending, waitlisted, notSelected] = await Promise.all([
      Attendee.countDocuments({ ...active, selectionStatus: "selected" }).session(session),
      Attendee.countDocuments({ ...active, selectionStatus: "pending" }).session(session),
      Attendee.countDocuments({ ...active, selectionStatus: "waitlisted" }).session(session),
      Attendee.countDocuments({ ...active, selectionStatus: "not_selected" }).session(session),
    ]);
    if (pending > 0) throw new EventSelectionError(`${pending} applications still require a decision.`, 409, { code: "PENDING_DECISIONS", pending });
    if (selected > settings.eventCapacity) throw new EventSelectionError("Selection cannot be finalized while selected participants exceed capacity.", 409, { code: "OVER_CAPACITY", selected, capacity: settings.eventCapacity });
    const now = new Date();
    await EventSettings.updateOne(
      { _id: settings._id },
      { $set: { selectionFinalized: true, selectionFinalizedAt: now, selectionFinalizedBy: new Types.ObjectId(input.adminId) } },
      { session },
    );
    return { selectionFinalized: true, selected, pending, waitlisted, notSelected, finalizedAt: now.toISOString() };
  });
}
