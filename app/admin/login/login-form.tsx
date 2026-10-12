"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [show, setShow] = useState(false); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); setPending(false); if (!response.ok) return setError("Invalid email or password."); router.replace("/admin"); router.refresh(); }
  return <form className="admin-login-form" onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<span className="admin-password"><input name="password" type={show ? "text" : "password"} autoComplete="current-password" required /><button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></span></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-button" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button></form>;
}
