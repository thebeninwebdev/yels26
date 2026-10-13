import Link from "next/link";
import { redirect } from "next/navigation";
import { event } from "@/app/event";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export const instant = false;

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const [venue, city, state] = event.location.split(", ");
  return <main className="admin-login"><div className="admin-login-layout"><section className="admin-login-brand"><Link href="/" className="admin-login-back">← Back to YELS 2026</Link><div className="admin-login-brand-copy"><p className="admin-login-kicker">YALI NETWORK EDO</p><p className="admin-login-wordmark">YELS <span>2026</span></p><h1>Youth Empowerment<br />&amp; Leadership<br />Summit <em>2026</em></h1><p className="admin-login-portal">Private admin portal</p></div><p className="admin-login-context">{venue.toUpperCase()}<br />{city.toUpperCase()}, {state.toUpperCase()}<br />{event.dateLabel.toUpperCase()}</p></section><section className="admin-login-panel"><p className="admin-login-kicker">ADMIN ACCESS</p><h2>Sign in</h2><p>Use your YELS admin account to continue.</p><LoginForm /></section></div></main>;
}
