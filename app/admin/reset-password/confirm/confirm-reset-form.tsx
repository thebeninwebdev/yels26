"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ConfirmResetForm() {
  const params = useSearchParams(); const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const password = new FormData(event.currentTarget).get("password"); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: password, token: params.get("token") }) }); setPending(false); if (!response.ok) return setError("This reset link is invalid or expired."); router.replace("/admin/login"); }
  return <section className="admin-reset-card"><p className="admin-login-kicker">ADMIN ACCESS</p><h1>Choose a new password</h1><p>Use a password you have not used before.</p><form className="admin-reset-form" onSubmit={submit}><label>New password<input name="password" type="password" minLength={10} maxLength={128} autoComplete="new-password" required /></label>{error && <p className="admin-error">{error}</p>}<button className="admin-button" disabled={pending}>{pending ? "Saving…" : "Reset password"}</button></form></section>;
}
