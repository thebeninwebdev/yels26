import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { BootcampClient, type BootcampApplicant } from "./bootcamp-client";

export const instant = false;

export default async function BootcampPage() {
  await connection();
  await connectToDatabase();
  const query = { registrationStatus: "registered", bootcampApplied: true };
  const [applicants, total, pending, selected, waitlisted, rejected] = await Promise.all([
    Attendee.find(query).sort({ createdAt: -1 }).lean(), Attendee.countDocuments(query), Attendee.countDocuments({ ...query, bootcampStatus: "pending" }), Attendee.countDocuments({ ...query, bootcampStatus: "approved" }), Attendee.countDocuments({ ...query, bootcampStatus: "waitlisted" }), Attendee.countDocuments({ ...query, bootcampStatus: "rejected" }),
  ]);
  return <BootcampClient applicants={JSON.parse(JSON.stringify(applicants)) as BootcampApplicant[]} stats={{ total, pending, selected, waitlisted, rejected }} />;
}
