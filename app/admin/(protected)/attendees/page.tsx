import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { dateTime, present, statusClass } from "@/lib/admin/format";

const allowed = { bootcamp: ["", "applied", "not_applied"], bootcampStatus: ["", "pending", "approved", "rejected", "waitlisted"], ticket: ["", "sent", "pending", "failed"], checkIn: ["", "checked_in", "not_checked_in"], registration: ["", "registered", "cancelled"] } as const;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function AttendeesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const filter = (key: keyof typeof allowed) => { const value = typeof raw[key] === "string" ? raw[key] : ""; return allowed[key].includes(value as never) ? value : ""; };
  const q = typeof raw.q === "string" ? raw.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number.parseInt(typeof raw.page === "string" ? raw.page : "1", 10) || 1);
  const bootcamp = filter("bootcamp"), bootcampStatus = filter("bootcampStatus"), ticket = filter("ticket"), checkIn = filter("checkIn"), registration = filter("registration");
  const query: Record<string, unknown> = {};
  if (q) { const regex = new RegExp(escapeRegex(q), "i"); query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { registrationId: regex }]; }
  if (bootcamp) query.bootcampApplied = bootcamp === "applied";
  if (bootcampStatus) query.bootcampStatus = bootcampStatus;
  if (ticket) query["ticketEmail.status"] = ticket;
  if (checkIn) query["checkIn.status"] = checkIn;
  if (registration) query.registrationStatus = registration;
  await connectToDatabase();
  const [count, attendees] = await Promise.all([Attendee.countDocuments(query), Attendee.find(query).sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25).select("fullName email phone participantType state cityOrLga bootcampApplied ticketEmail.status createdAt").lean()]);
  const pages = Math.max(1, Math.ceil(count / 25));
  const href = (target: number) => { const p = new URLSearchParams(); if (q) p.set("q", q); for (const [key, value] of Object.entries({ bootcamp, bootcampStatus, ticket, checkIn, registration })) if (value) p.set(key, value); p.set("page", String(target)); return `/admin/attendees?${p}`; };
  return <section className="admin-page"><h1>Attendees</h1><p className="admin-subtitle">Search and review YELS 2026 registration records.</p><form className="admin-filters"><input name="q" defaultValue={q} placeholder="Search name, email, phone or ID" /><select name="bootcamp" defaultValue={bootcamp}><option value="">All Bootcamp</option><option value="applied">Applied</option><option value="not_applied">Not applied</option></select><select name="bootcampStatus" defaultValue={bootcampStatus}><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="waitlisted">Waitlisted</option></select><select name="ticket" defaultValue={ticket}><option value="">All tickets</option><option value="sent">Sent</option><option value="pending">Pending</option><option value="failed">Failed</option></select><select name="checkIn" defaultValue={checkIn}><option value="">All check-ins</option><option value="checked_in">Checked in</option><option value="not_checked_in">Not checked in</option></select><select name="registration" defaultValue={registration}><option value="">All registrations</option><option value="registered">Registered</option><option value="cancelled">Cancelled</option></select><button className="admin-button">Apply</button></form><section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Participant</th><th>Location</th><th>Bootcamp</th><th>Ticket</th><th>Registered</th><th /></tr></thead><tbody>{attendees.map((a) => <tr key={a._id.toString()}><td>{a.fullName}</td><td>{a.email}</td><td>{a.phone}</td><td>{present(a.participantType)}</td><td>{a.state}, {a.cityOrLga}</td><td>{a.bootcampApplied ? "Applied" : "—"}</td><td><span className={statusClass(a.ticketEmail?.status)}>{present(a.ticketEmail?.status)}</span></td><td>{dateTime(a.createdAt)}</td><td><Link href={`/admin/attendees/${a._id}`}>View</Link></td></tr>)}</tbody></table></div><nav className="admin-pagination">{page > 1 && <Link href={href(page - 1)}>Previous</Link>}<span>Page {Math.min(page, pages)} of {pages}</span>{page < pages && <Link href={href(page + 1)}>Next</Link>}</nav></section></section>;
}
