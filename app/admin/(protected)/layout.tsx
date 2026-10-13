import "../admin.css";
import "../attendees.css";
import "../attendees-loading.css";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "../components/admin-nav";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell"><AdminNav fullName={admin.fullName} email={admin.email} /><main className="admin-main"><header className="admin-utility"><Link className="admin-utility-action" href="/admin/attendees">View attendees <span>→</span></Link></header>{children}</main></div>;
}
