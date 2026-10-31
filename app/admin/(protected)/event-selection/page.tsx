import { connection } from "next/server";
import { buildEventSelectionQuery, parseEventSelectionFilters } from "@/lib/admin/event-selection";
import { getEventSettings } from "@/lib/admin/event-settings";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import type { AttendeeRecord } from "../attendees/attendees-client";
import { EventSelectionClient } from "./event-selection-client";

export const instant = false;
const PAGE_SIZE = 25;

export default async function EventSelectionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const raw = await searchParams;
  const filters = parseEventSelectionFilters(raw);
  const requestedPage = Math.max(1, Number.parseInt(typeof raw.page === "string" ? raw.page : "1", 10) || 1);
  const query = buildEventSelectionQuery(filters);
  await connectToDatabase();
  const active = { registrationStatus: "registered" } as const;
  const [count, applications, selected, waitlisted, pending, notSelected, settings, states] = await Promise.all([
    Attendee.countDocuments(query),
    Attendee.countDocuments(active),
    Attendee.countDocuments({ ...active, selectionStatus: "selected" }),
    Attendee.countDocuments({ ...active, selectionStatus: "waitlisted" }),
    Attendee.countDocuments({ ...active, $or: [{ selectionStatus: "pending" }, { selectionStatus: { $exists: false } }] }),
    Attendee.countDocuments({ ...active, selectionStatus: "not_selected" }),
    getEventSettings(),
    Attendee.distinct("state", active),
  ]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const applicants = await Attendee.find(query).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean();
  return <EventSelectionClient
    applicants={JSON.parse(JSON.stringify(applicants)) as AttendeeRecord[]}
    filters={filters}
    stats={{ applications, selected, waitlisted, pending, notSelected }}
    capacity={settings.eventCapacity}
    selectionFinalized={settings.selectionFinalized}
    states={(states as string[]).filter(Boolean).sort()}
    count={count}
    page={page}
    pages={pages}
  />;
}
