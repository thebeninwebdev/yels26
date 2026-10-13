export const attendeeViews = ["all", "checked_in", "not_checked_in", "bootcamp_applicants", "bootcamp_selected"] as const;
export type AttendeeView = typeof attendeeViews[number];

export type AttendeeFilters = {
  q: string;
  view: AttendeeView;
  participantType: string;
  bootcampStatus: string;
  checkIn: string;
  from: string;
  to: string;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const allowedParticipantTypes = ["student", "recent_graduate", "young_professional", "entrepreneur", "private_sector", "government", "ngo", "other"];
const allowedBootcampStatuses = ["not_applied", "pending", "approved", "rejected", "waitlisted"];
const allowedCheckIn = ["checked_in", "not_checked_in"];

export function parseAttendeeFilters(raw: Record<string, string | string[] | undefined>): AttendeeFilters {
  const viewValue = one(raw.view);
  const participantType = one(raw.participantType);
  const bootcampStatus = one(raw.bootcampStatus);
  const checkIn = one(raw.checkIn);
  return {
    q: one(raw.q).trim().slice(0, 100),
    view: attendeeViews.includes(viewValue as AttendeeView) ? viewValue as AttendeeView : "all",
    participantType: allowedParticipantTypes.includes(participantType) ? participantType : "",
    bootcampStatus: allowedBootcampStatuses.includes(bootcampStatus) ? bootcampStatus : "",
    checkIn: allowedCheckIn.includes(checkIn) ? checkIn : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(one(raw.from)) ? one(raw.from) : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(one(raw.to)) ? one(raw.to) : "",
  };
}

export function buildAttendeeQuery(filters: AttendeeFilters) {
  const conditions: Record<string, unknown>[] = [{ registrationStatus: "registered" }];
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i");
    conditions.push({ $or: [{ fullName: regex }, { email: regex }, { phone: regex }, { registrationId: regex }] });
  }
  if (filters.view === "checked_in") conditions.push({ "checkIn.status": "checked_in" });
  if (filters.view === "not_checked_in") conditions.push({ "checkIn.status": "not_checked_in" });
  if (filters.view === "bootcamp_applicants") conditions.push({ bootcampApplied: true });
  if (filters.view === "bootcamp_selected") conditions.push({ bootcampStatus: "approved" });
  if (filters.participantType) conditions.push({ participantType: filters.participantType });
  if (filters.bootcampStatus) conditions.push({ bootcampStatus: filters.bootcampStatus });
  if (filters.checkIn) conditions.push({ "checkIn.status": filters.checkIn });
  if (filters.from || filters.to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (filters.from) createdAt.$gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to) createdAt.$lte = new Date(`${filters.to}T23:59:59.999Z`);
    conditions.push({ createdAt });
  }
  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

export function filtersToParams(filters: AttendeeFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value && !(key === "view" && value === "all")) params.set(key, value);
  return params;
}
