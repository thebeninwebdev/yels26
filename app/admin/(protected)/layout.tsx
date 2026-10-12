import "../admin.css";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
export const instant = false;
export default async function AdminLayout({ children }: { children: React.ReactNode }) { const admin = await requireAdmin(); return <div className="admin-shell"><aside className="admin-sidebar"><div><p className="admin-kicker">YELS 2026</p><strong>ADMIN</strong><nav><Link href="/admin">Overview</Link><Link href="/admin/attendees">Attendees</Link><Link href="/admin/settings">Settings</Link></nav></div><div className="admin-account"><b>{admin.fullName}</b><span>{admin.email}</span><form action="/api/admin/logout" method="post"><button>Sign out</button></form></div></aside><main className="admin-main"><header className="admin-mobile-head"><span>YELS 2026 · ADMIN</span><form action="/api/admin/logout" method="post"><button>Sign out</button></form></header>{children}</main></div>; }
