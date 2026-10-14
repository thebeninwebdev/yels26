"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function PasswordInput({ label, name, autoComplete }: { label: string; name: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}<span className="admin-password-input"><input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={10} maxLength={128} required /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.8 10.8 0 0 1 12 4.9c5.1 0 8.7 4.2 9.6 7.1a11.5 11.5 0 0 1-3.1 4.6M6.3 6.4C4.2 7.8 2.8 10.1 2.4 12c.7 2.5 4.3 7.1 9.6 7.1 1.3 0 2.5-.3 3.5-.8" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>}</button></span></label>;
}

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") }) }); setPending(false); if (!response.ok) return setError((await response.json()).error ?? "Unable to change password."); setMessage("Password changed successfully. Please sign in again."); setTimeout(() => router.replace("/admin/login"), 800); }
  return <form className="admin-settings" onSubmit={submit}><h2>Account</h2><label>Full name<input value={name} readOnly /></label><label>Email<input value={email} readOnly /></label><h2>Change password</h2><PasswordInput label="Current password" name="currentPassword" autoComplete="current-password" /><PasswordInput label="New password" name="newPassword" autoComplete="new-password" /><PasswordInput label="Confirm new password" name="confirmPassword" autoComplete="new-password" />{error && <p className="admin-error">{error}</p>}{message && <p className="admin-success">{message}</p>}<button className="admin-button" disabled={pending}>{pending ? "Changing password…" : "Change password"}</button></form>;
}
