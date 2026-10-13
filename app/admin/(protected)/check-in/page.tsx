import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { CheckInScanner } from "./scanner";

export const instant = false;
export default async function CheckInPage() { await connection(); await connectToDatabase(); const [total, checkedIn, recent] = await Promise.all([Attendee.countDocuments({ registrationStatus: "registered" }), Attendee.countDocuments({ "checkIn.status": "checked_in" }), Attendee.find({ "checkIn.status": "checked_in" }).sort({ "checkIn.checkedInAt": -1 }).limit(5).select("fullName checkIn.checkedInAt").lean()]); return <section className="admin-checkin-page"><CheckInScanner initialCheckedIn={checkedIn} total={total} recent={recent.map((attendee) => ({ name: attendee.fullName, checkedInAt: attendee.checkIn?.checkedInAt?.toISOString() ?? "" }))} /></section>; }
