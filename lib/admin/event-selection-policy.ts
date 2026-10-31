export const DEFAULT_EVENT_CAPACITY = 70;
export const MAX_EVENT_CAPACITY = 10_000;

export const eventSelectionStatuses = ["pending", "selected", "waitlisted", "not_selected"] as const;
export type EventSelectionStatus = typeof eventSelectionStatuses[number];

export type CapacitySummary = {
  capacity: number;
  selected: number;
  remainingCapacity: number;
  overCapacity: number;
};

export function capacitySummary(selected: number, capacity: number): CapacitySummary {
  return {
    capacity,
    selected,
    remainingCapacity: Math.max(0, capacity - selected),
    overCapacity: Math.max(0, selected - capacity),
  };
}

export function additionsForSelection(currentStatuses: EventSelectionStatus[], targetStatus: EventSelectionStatus) {
  if (targetStatus !== "selected") return 0;
  return currentStatuses.filter((status) => status !== "selected").length;
}

export function selectionCapacityError(capacity: number, selected: number, tryingToAdd: number) {
  const availablePlaces = Math.max(0, capacity - selected);
  if (tryingToAdd <= availablePlaces) return null;
  return {
    error: "This would exceed the current event capacity.",
    capacity,
    currentlySelected: selected,
    tryingToAdd,
    availablePlaces,
  };
}

export function canApproveAllPending(capacity: number, selected: number, pending: number) {
  return pending > 0 && pending <= Math.max(0, capacity - selected);
}

export function isEventEntryEligible(registrationStatus: string, selectionStatus: string) {
  return registrationStatus === "registered" && selectionStatus === "selected";
}

export function buildSelectionUpdate(status: EventSelectionStatus, adminId: unknown, decidedAt: Date) {
  if (status === "pending") {
    return { $set: { selectionStatus: status }, $unset: { selectionDecision: 1 } };
  }
  return { $set: { selectionStatus: status, selectionDecision: { decidedAt, decidedBy: adminId } } };
}
