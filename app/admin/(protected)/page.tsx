import Link from "next/link";
import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { dateTime, present } from "@/lib/admin/format";

export default async function OverviewPage() {
  await connection();
  await connectToDatabase();
  const [total, bootcamp, tickets, checkedIn, recent] = await Promise.all([
    Attendee.countDocuments({ registrationStatus: "registered" }), Attendee.countDocuments({ bootcampApplied: true }),
    Attendee.countDocuments({ "ticketEmail.status": "sent" }), Attendee.countDocuments({ "checkIn.status": "checked_in" }),
    Attendee.find().sort({ createdAt: -1 }).limit(10).select("fullName email participantType bootcampApplied createdAt").lean(),
  ]);
  return <section className="admin-page"><h1>Overview</h1><p className="admin-subtitle">YELS 2026 registration overview</p><div className="admin-cards">{[["Total registrations", total], ["Bootcamp applications", bootcamp], ["Tickets sent", tickets], ["Checked in", checkedIn]].map(([label, value]) => <article className="admin-card" key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="admin-panel"><h2>Recent registrations</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Participant</th><th>Bootcamp</th><th>Registered</th><th /></tr></thead><tbody>{recent.map((a) => <tr key={a._id.toString()}><td>{a.fullName}</td><td>{a.email}</td><td>{present(a.participantType)}</td><td>{a.bootcampApplied ? "Applied" : "—"}</td><td>{dateTime(a.createdAt)}</td><td><Link href={`/admin/attendees/${a._id}`}>View</Link></td></tr>)}</tbody></table></div></section></section>;
}
