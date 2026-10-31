import { Suspense } from "react";
import { ConfirmResetForm } from "./confirm-reset-form";

export default function ConfirmResetPage() {
  return <main className="admin-reset-page"><Suspense fallback={<section className="admin-reset-card"><p className="admin-login-kicker">ADMIN ACCESS</p><h1>Choose a new password</h1><p>Loading reset form…</p></section>}><ConfirmResetForm /></Suspense></main>;
}
