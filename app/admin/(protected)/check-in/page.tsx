import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { CheckInScanner } from "./scanner";

export const instant = false;
export default async function CheckInPage() { await connection(); await connectToDatabase(); const [total, checkedIn, recent] = await Promise.all([Attendee.countDocuments({ registrationStatus: "registered" }), Attendee.countDocuments({ "checkIn.status": "checked_in" }), Attendee.find({ "checkIn.status": "checked_in" }).sort({ "checkIn.checkedInAt": -1 }).limit(5).select("fullName checkIn.checkedInAt").lean()]); return <section className="admin-page admin-checkin-page"><header className="admin-page-head"><div><p className="admin-context">EVENT OPERATIONS</p><h1>Check-in</h1><p className="admin-subtitle">Scan attendee tickets as guests arrive.</p></div><div className="admin-checkin-count"><strong>{checkedIn}</strong><span>checked in / {total}</span></div></header><CheckInScanner initialCheckedIn={checkedIn} total={total} recent={recent.map((attendee) => ({ name: attendee.fullName, checkedInAt: attendee.checkIn?.checkedInAt?.toISOString() ?? "" }))} /></section>; }
