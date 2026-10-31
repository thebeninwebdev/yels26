import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_EVENT_CAPACITY,
  additionsForSelection,
  buildSelectionUpdate,
  canApproveAllPending,
  capacitySummary,
  isEventEntryEligible,
  selectionCapacityError,
} from "../lib/admin/event-selection-policy.ts";

test("default event capacity is 70", () => assert.equal(DEFAULT_EVENT_CAPACITY, 70));

test("capacity summaries cover remaining, full, and reduced over-capacity states", () => {
  assert.deepEqual(capacitySummary(47, 70), { capacity: 70, selected: 47, remainingCapacity: 23, overCapacity: 0 });
  assert.deepEqual(capacitySummary(70, 70), { capacity: 70, selected: 70, remainingCapacity: 0, overCapacity: 0 });
  assert.deepEqual(capacitySummary(75, 70), { capacity: 70, selected: 75, remainingCapacity: 0, overCapacity: 5 });
});

test("approve all succeeds only when every pending applicant fits", () => {
  assert.equal(canApproveAllPending(70, 0, 58), true);
  assert.equal(canApproveAllPending(70, 20, 60), false);
});

test("bulk selection counts only applicants not already selected", () => {
  assert.equal(additionsForSelection(Array(8).fill("pending"), "selected"), 8);
  assert.equal(selectionCapacityError(70, 60, 8), null);
  assert.deepEqual(selectionCapacityError(70, 68, 5), { error: "This would exceed the current event capacity.", capacity: 70, currentlySelected: 68, tryingToAdd: 5, availablePlaces: 2 });
  assert.equal(additionsForSelection(["selected", "pending", "waitlisted"], "selected"), 2);
});

test("moving selected participants to waitlisted or not selected releases capacity", () => {
  assert.equal(additionsForSelection(["selected"], "waitlisted"), 0);
  assert.equal(additionsForSelection(["selected"], "not_selected"), 0);
  assert.equal(capacitySummary(69, 70).remainingCapacity, 1);
});

test("event decision update never mutates Bootcamp state", () => {
  const update = buildSelectionUpdate("selected", "admin-id", new Date("2026-10-31T00:00:00Z"));
  assert.equal(update.$set.selectionStatus, "selected");
  assert.equal(JSON.stringify(update).includes("bootcamp"), false);
});

test("Bootcamp decision route never mutates event selection state", async () => {
  const source = await readFile(new URL("../app/api/admin/bootcamp/[id]/decision/route.ts", import.meta.url), "utf8");
  assert.equal(source.includes("selectionStatus"), false);
});

test("only active selected registrations are eligible for event entry", () => {
  assert.equal(isEventEntryEligible("registered", "selected"), true);
  assert.equal(isEventEntryEligible("registered", "pending"), false);
  assert.equal(isEventEntryEligible("registered", "waitlisted"), false);
  assert.equal(isEventEntryEligible("registered", "not_selected"), false);
  assert.equal(isEventEntryEligible("cancelled", "selected"), false);
});
