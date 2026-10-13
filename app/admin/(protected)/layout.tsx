import "../admin.css";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav, Icon } from "../components/admin-nav";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell"><AdminNav fullName={admin.fullName} email={admin.email} /><main className="admin-main"><header className="admin-utility"><form action="/admin/attendees"><Icon name="search" /><input name="q" placeholder="Search attendees by name, email, phone or ID" /></form><Link className="admin-utility-action" href="/admin/attendees">View attendees <span>→</span></Link></header>{children}</main></div>;
}
