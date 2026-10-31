import { eventSelectionStatuses, type EventSelectionStatus } from "./event-selection-policy";

export type EventSelectionFilters = {
  q: string;
  status: "all" | EventSelectionStatus;
  participantType: string;
  state: string;
  gender: string;
  bootcampApplied: string;
  bootcampStatus: string;
  from: string;
  to: string;
};

const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const participantTypes = ["student", "recent_graduate", "young_professional", "entrepreneur", "private_sector", "government", "ngo", "other"];
const genders = ["male", "female", "prefer_not_to_say"];
const bootcampStatuses = ["not_applied", "pending", "approved", "rejected", "waitlisted"];

export function parseEventSelectionFilters(raw: Record<string, string | string[] | undefined>): EventSelectionFilters {
  const status = one(raw.status);
  const participantType = one(raw.participantType);
  const gender = one(raw.gender);
  const bootcampApplied = one(raw.bootcampApplied);
  const bootcampStatus = one(raw.bootcampStatus);
  return {
    q: one(raw.q).trim().slice(0, 100),
    status: status === "all" || eventSelectionStatuses.includes(status as EventSelectionStatus) ? status as EventSelectionFilters["status"] : "all",
    participantType: participantTypes.includes(participantType) ? participantType : "",
    state: one(raw.state).trim().slice(0, 100),
    gender: genders.includes(gender) ? gender : "",
    bootcampApplied: ["yes", "no"].includes(bootcampApplied) ? bootcampApplied : "",
    bootcampStatus: bootcampStatuses.includes(bootcampStatus) ? bootcampStatus : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(one(raw.from)) ? one(raw.from) : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(one(raw.to)) ? one(raw.to) : "",
  };
}

export function buildEventSelectionQuery(filters: EventSelectionFilters) {
  const conditions: Record<string, unknown>[] = [{ registrationStatus: "registered" }];
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i");
    conditions.push({ $or: [{ fullName: regex }, { email: regex }, { phone: regex }, { registrationId: regex }] });
  }
  if (filters.status !== "all") conditions.push({ selectionStatus: filters.status });
  if (filters.participantType) conditions.push({ participantType: filters.participantType });
  if (filters.state) conditions.push({ state: new RegExp(`^${escapeRegex(filters.state)}$`, "i") });
  if (filters.gender) conditions.push({ gender: filters.gender });
  if (filters.bootcampApplied) conditions.push({ bootcampApplied: filters.bootcampApplied === "yes" });
  if (filters.bootcampStatus) conditions.push({ bootcampStatus: filters.bootcampStatus });
  if (filters.from || filters.to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (filters.from) createdAt.$gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to) createdAt.$lte = new Date(`${filters.to}T23:59:59.999Z`);
    conditions.push({ createdAt });
  }
  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}
