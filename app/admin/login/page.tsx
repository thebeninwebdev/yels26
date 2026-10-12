import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";
export const instant = false;
export default async function AdminLoginPage() { if (await getAdminSession()) redirect("/admin"); return <main className="admin-login"><section><p className="admin-kicker">YELS 2026</p><h1>Admin Portal</h1><p>Sign in to manage registrations securely.</p><LoginForm /></section></main>; }
