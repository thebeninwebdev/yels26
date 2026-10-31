import { connection } from "next/server";
import { buildAttendeeQuery, parseAttendeeFilters } from "@/lib/admin/attendees";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { getEventSettings } from "@/lib/admin/event-settings";
import { AttendeesClient, type AttendeeRecord } from "./attendees-client";

export const instant = false;
const PAGE_SIZE = 25;

export default async function AttendeesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const raw = await searchParams;
  const filters = parseAttendeeFilters(raw);
  const page = Math.max(1, Number.parseInt(typeof raw.page === "string" ? raw.page : "1", 10) || 1);
  const query = buildAttendeeQuery(filters);
  await connectToDatabase();
  const [count, attendees, total, checkedIn, yelsSelected, applicants, bootcampSelected, eventSettings] = await Promise.all([
    Attendee.countDocuments(query),
    Attendee.find(query).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Attendee.countDocuments({ registrationStatus: "registered" }),
    Attendee.countDocuments({ registrationStatus: "registered", "checkIn.status": "checked_in" }),
    Attendee.countDocuments({ registrationStatus: "registered", selectionStatus: "selected" }),
    Attendee.countDocuments({ registrationStatus: "registered", bootcampApplied: true }),
    Attendee.countDocuments({ registrationStatus: "registered", bootcampStatus: "approved" }),
    getEventSettings(),
  ]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const records = JSON.parse(JSON.stringify(attendees)) as AttendeeRecord[];
  return <AttendeesClient attendees={records} filters={filters} stats={{ total, checkedIn, notCheckedIn: Math.max(0, total - checkedIn), yelsSelected, applicants, bootcampSelected }} selectionFinalized={eventSettings.selectionFinalized} count={count} page={safePage} pages={pages} />;
}
