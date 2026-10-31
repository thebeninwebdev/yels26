import { requireAdmin } from "@/lib/admin/auth";
import { getEventSettings } from "@/lib/admin/event-settings";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";
import { SettingsForm } from "./settings-form";
import { EventSettingsForm } from "./event-settings-form";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  await connectToDatabase();
  const [eventSettings, selected] = await Promise.all([
    getEventSettings(),
    Attendee.countDocuments({ registrationStatus: "registered", selectionStatus: "selected" }),
  ]);
  return <section className="admin-page admin-settings-page">
    <p className="admin-context">ADMIN SETTINGS</p><h1>Settings</h1><p className="admin-subtitle">Manage event capacity and your admin account.</p>
    <div className="admin-settings-grid">
      <section className="admin-panel"><EventSettingsForm initialCapacity={eventSettings.eventCapacity} selected={selected} /></section>
      <section className="admin-panel"><SettingsForm name={admin.fullName} email={admin.email} /></section>
    </div>
  </section>;
}
