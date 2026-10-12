import { requireAdmin } from "@/lib/admin/auth";
import { SettingsForm } from "./settings-form";
export default async function SettingsPage() { const admin = await requireAdmin(); return <section className="admin-page"><h1>Settings</h1><p className="admin-subtitle">Manage your admin account.</p><section className="admin-panel"><SettingsForm name={admin.fullName} email={admin.email} /></section></section>; }
