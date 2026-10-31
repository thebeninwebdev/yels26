import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { EventSettings } from "@/lib/models/event-settings";
import { DEFAULT_EVENT_CAPACITY } from "./event-selection-policy";
import type { ClientSession } from "mongoose";

export type EventSettingsValue = {
  eventCapacity: number;
  selectionFinalized: boolean;
  selectionFinalizedAt?: string;
};

export async function getEventSettings(): Promise<EventSettingsValue> {
  await connectToDatabase();
  const settings = await EventSettings.findOne({ key: "event" }).lean();
  return {
    eventCapacity: settings?.eventCapacity ?? DEFAULT_EVENT_CAPACITY,
    selectionFinalized: settings?.selectionFinalized ?? false,
    selectionFinalizedAt: settings?.selectionFinalizedAt?.toISOString(),
  };
}

export async function ensureEventSettings(options: { session?: ClientSession } = {}) {
  return EventSettings.findOneAndUpdate(
    { key: "event" },
    { $setOnInsert: { key: "event", eventCapacity: DEFAULT_EVENT_CAPACITY, selectionFinalized: false } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session: options.session },
  );
}
