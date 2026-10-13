import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { dateTime, present } from "@/lib/admin/format";

export const instant = false;

export default async function OverviewPage() {
  await connection();
  const admin = await requireAdmin();
  await connectToDatabase();
  const [total, bootcamp, tickets, checkedIn, recent] = await Promise.all([Attendee.countDocuments({ registrationStatus: "registered" }), Attendee.countDocuments({ bootcampApplied: true }), Attendee.countDocuments({ "ticketEmail.status": "sent" }), Attendee.countDocuments({ "checkIn.status": "checked_in" }), Attendee.find().sort({ createdAt: -1 }).limit(10).select("fullName email participantType bootcampApplied createdAt").lean()]);
  const metrics = [["Registrations", total], ["Bootcamp applicants", bootcamp], ["Tickets sent", tickets], ["Checked in", checkedIn]];
  const firstName = admin.fullName.trim().split(/\s+/)[0] || "there";
  return <section className="admin-page admin-overview"><header className="admin-page-head"><div><p className="admin-context">YELS 2026 · 5 DECEMBER 2026</p><h1>Welcome back, {firstName}.</h1></div><Link href="/admin/attendees" className="admin-page-action">Open attendee list <span>→</span></Link></header><div className="admin-metrics">{metrics.map(([label, value]) => <article className="admin-metric" key={String(label)}><strong>{value}</strong><span>{label}</span></article>)}</div><section className="admin-panel admin-recent"><header className="admin-panel-head"><h2>Recent registrations</h2><Link href="/admin/attendees">View all →</Link></header><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Attendee</th><th>Participant</th><th>Bootcamp</th><th>Registered</th><th>Action</th></tr></thead><tbody>{recent.map((a) => <tr key={a._id.toString()}><td><b>{a.fullName}</b><small>{a.email}</small></td><td>{present(a.participantType)}</td><td><span className={a.bootcampApplied ? "admin-badge admin-badge-applied" : "admin-table-muted"}>{a.bootcampApplied ? "Applied" : "Not applied"}</span></td><td>{dateTime(a.createdAt)}</td><td><Link href={`/admin/attendees/${a._id}`}>View →</Link></td></tr>)}</tbody></table></div></section><div className="admin-lower-grid"><section className="admin-panel"><header className="admin-panel-head"><h2>Registration breakdown</h2></header><div className="admin-breakdown">{metrics.map(([label, value], index) => <div key={String(label)}><span>{label}</span><b>{value}</b><i><em style={{ width: `${total ? (Number(value) / total) * 100 : 0}%` }} className={`bar-${index}`} /></i></div>)}</div></section><section className="admin-panel"><header className="admin-panel-head"><h2>Event operations</h2></header><div className="admin-operations"><Link href="/admin/attendees"><span>Attendee records<small>Search, filter and inspect registrations</small></span>→</Link><Link href="/admin/settings"><span>Account settings<small>Manage your password</small></span>→</Link><Link href="/register"><span>Public registration<small>Open registration page</small></span>→</Link><Link href="/"><span>Public YELS website<small>View homepage</small></span>→</Link></div></section></div></section>;
}
