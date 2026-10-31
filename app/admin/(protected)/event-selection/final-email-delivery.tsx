"use client";

import { useRef, useState } from "react";
import type { EmailDeliverySummary, EmailQuota, EmailSendMode } from "@/lib/admin/event-selection-emails";

type BatchResponse = {
  summary: EmailDeliverySummary;
  quota: EmailQuota;
  batch: { attempted: number; sent: number; failed: number };
  quotaExhausted: boolean;
  rateLimited: boolean;
};

const formatReset = (value: string | null) => value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : null;

export function FinalEmailDelivery({ selectionFinalized, initialSummary, initialQuota }: { selectionFinalized: boolean; initialSummary: EmailDeliverySummary; initialQuota: EmailQuota }) {
  const [summary, setSummary] = useState(initialSummary);
  const [quota, setQuota] = useState(initialQuota);
  const [confirmMode, setConfirmMode] = useState<EmailSendMode | null>(null);
  const [active, setActive] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [message, setMessage] = useState("");
  const stop = useRef(false);

  const requestBatch = async (mode: EmailSendMode, attendeeId?: string) => {
    const response = await fetch("/api/admin/event-selection/emails/send-batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, attendeeId }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Final emails could not be processed.");
    return result as BatchResponse;
  };

  const run = async (mode: EmailSendMode) => {
    setConfirmMode(null); setActive(true); setStopping(false); setMessage(""); stop.current = false;
    let retryBudget = mode === "failed" ? summary.failed : Number.POSITIVE_INFINITY;
    try {
      while (!stop.current && retryBudget > 0) {
        const result = await requestBatch(mode);
        setSummary(result.summary); setQuota(result.quota);
        retryBudget -= result.batch.attempted;
        if (!result.batch.attempted || result.quotaExhausted || result.rateLimited || (mode === "pending" ? result.summary.ready === 0 : result.summary.failed === 0)) {
          if (result.quotaExhausted) setMessage("Daily email limit reached. Progress is saved; continue after the provider allowance resets.");
          else if (result.rateLimited) setMessage("Resend rate-limited the current batch. The failed recipient can be retried safely.");
          break;
        }
      }
      if (stop.current) setMessage("Sending stopped after the current batch. Progress has been saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Final emails could not be processed.");
    } finally { setActive(false); setStopping(false); }
  };

  const retryOne = async (id: string) => {
    setMessage("");
    try {
      const result = await requestBatch("failed", id);
      setSummary(result.summary); setQuota(result.quota);
      if (result.rateLimited || result.quotaExhausted) setMessage("This email could not be retried because the provider limit was reached.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Email retry failed."); }
  };

  const percent = summary.selected ? Math.min(100, Math.round(summary.sent / summary.selected * 100)) : 0;
  const quotaReset = formatReset(quota.resetsAt);
  return <section className={`final-email-delivery${summary.complete ? " complete" : ""}`}>
    <header><div><p className="admin-context">FINAL EMAIL DELIVERY</p><h2>{summary.complete ? "All final emails sent" : active ? "Sending final emails" : "Selected participant emails"}</h2><p>{selectionFinalized ? "Send each selected participant one confirmation email with their QR ticket and current Bootcamp outcome." : "Complete and finalize event selection before sending participant emails."}</p></div>{summary.complete && <strong className="email-complete-mark">✓ {summary.sent} / {summary.selected}</strong>}</header>
    <div className="email-delivery-stats"><div><strong>{summary.selected}</strong><span>Selected</span></div><div><strong>{summary.sent}</strong><span>Sent</span></div><div><strong>{summary.ready}</strong><span>Ready</span></div><div><strong>{summary.sending}</strong><span>Sending</span></div><div><strong>{summary.failed}</strong><span>Failed</span></div></div>
    {(active || summary.sent > 0) && <div className="email-progress"><div><i style={{ width: `${percent}%` }} /></div><span>{summary.sent} / {summary.selected} sent</span></div>}
    <div className="email-quota"><strong>RESEND TODAY</strong>{quota.available ? quota.limit === null ? <span>{quota.used} used · Daily email limit: No limit</span> : <span>{quota.used} / {quota.limit} used · {quota.remaining} available{quotaReset ? ` · Resets ${quotaReset}` : ""}</span> : <span>Email quota information unavailable. Sending will still stop safely on provider errors.</span>}</div>
    {active && <p className="email-process-note">Keep this page open to continue sending. If you leave, progress is saved and you can resume later.</p>}
    {message && <p className="email-delivery-message" role="status">{message}</p>}
    <div className="email-delivery-actions">
      {!selectionFinalized ? <button disabled>Finalize selection first</button> : <>
        {summary.ready > 0 && <button className="primary" disabled={active} onClick={() => setConfirmMode("pending")}>{summary.sent ? "Continue sending" : "Send decision emails"}</button>}
        {summary.failed > 0 && <button disabled={active} onClick={() => setConfirmMode("failed")}>Retry failed</button>}
        {active && <button onClick={() => { stop.current = true; setStopping(true); }} disabled={stopping}>{stopping ? "Stopping…" : "Stop after current batch"}</button>}
      </>}
    </div>
    {summary.failedRecipients.length > 0 && <div className="email-failures"><h3>Failed emails</h3>{summary.failedRecipients.map((recipient) => <article key={recipient.id}><div><strong>{recipient.fullName}</strong><span>{recipient.email} · {recipient.registrationId}</span><small>{recipient.lastError} · {recipient.attempts} attempt{recipient.attempts === 1 ? "" : "s"}{recipient.lastAttemptAt ? ` · ${formatReset(recipient.lastAttemptAt)}` : ""}</small></div><button disabled={active} onClick={() => void retryOne(recipient.id)}>Retry</button></article>)}</div>}
    {confirmMode && <div className="event-confirm-backdrop"><section className="event-confirm" role="dialog" aria-modal="true" aria-labelledby="email-confirm-title"><h2 id="email-confirm-title">{confirmMode === "pending" ? summary.sent ? "Continue sending final emails?" : "Send final YELS 2026 emails?" : "Retry failed final emails?"}</h2><p>{confirmMode === "pending" ? <>{summary.sent > 0 && <>{summary.sent} have already been sent. </>}{summary.ready} selected participant{summary.ready === 1 ? "" : "s"} will receive their event confirmation and QR ticket.</> : <>{summary.failed} failed email{summary.failed === 1 ? "" : "s"} will be attempted once. Any further failures will remain available for another explicit retry.</>}</p><p>Bootcamp outcomes that have already been decided will be included. Already-sent participants will not receive duplicates.</p><footer><button onClick={() => setConfirmMode(null)}>Cancel</button><button className="primary" onClick={() => void run(confirmMode)}>{confirmMode === "pending" ? `Send remaining ${summary.ready}` : `Retry ${summary.failed}`}</button></footer></section></div>}
  </section>;
}
