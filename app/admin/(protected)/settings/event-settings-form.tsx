"use client";

import { FormEvent, useState } from "react";

export function EventSettingsForm({ initialCapacity, selected }: { initialCapacity: number; selected: number }) {
  const [capacity, setCapacity] = useState(String(initialCapacity));
  const [savedCapacity, setSavedCapacity] = useState(initialCapacity);
  const [pendingCapacity, setPendingCapacity] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const save = async (value: number) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/settings/event", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventCapacity: value }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Event capacity could not be updated.");
      setSavedCapacity(result.eventCapacity); setCapacity(String(result.eventCapacity)); setPendingCapacity(null);
      setMessage(`Event capacity updated to ${result.eventCapacity}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Event capacity could not be updated.");
    } finally { setBusy(false); }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage("");
    const value = Number(capacity);
    if (!Number.isInteger(value) || value < 1 || value > 10_000) return setError("Enter a whole number between 1 and 10,000.");
    if (value < selected) return setPendingCapacity(value);
    void save(value);
  };

  return <>
    <form className="event-settings-form" onSubmit={submit}>
      <p className="admin-context">EVENT SETTINGS</p><h2>Event Capacity</h2><p>Set the maximum number of participants for the main YELS 2026 event.</p>
      <label>Maximum participants<input type="number" min="1" max="10000" step="1" inputMode="numeric" value={capacity} onChange={(event) => setCapacity(event.target.value)} disabled={busy} /></label>
      <div className="event-settings-current"><span>Currently selected</span><strong>{selected.toLocaleString()}</strong><small>Saved capacity: {savedCapacity.toLocaleString()}</small></div>
      {error && <p className="admin-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
      <button className="admin-button" disabled={busy}>{busy ? "Saving capacity…" : "Save capacity"}</button>
    </form>
    {pendingCapacity !== null && <div className="event-confirm-backdrop"><section className="event-confirm" role="dialog" aria-modal="true" aria-labelledby="capacity-confirm-title"><h2 id="capacity-confirm-title">Reduce event capacity?</h2><p><strong>{selected}</strong> participants are currently selected.</p><p>Reducing capacity to <strong>{pendingCapacity}</strong> will place the event <strong>{selected - pendingCapacity}</strong> participants over capacity. No participant will be automatically removed.</p><footer><button onClick={() => setPendingCapacity(null)} disabled={busy}>Cancel</button><button className="primary" onClick={() => void save(pendingCapacity)} disabled={busy}>{busy ? "Saving…" : "Save capacity"}</button></footer></section></div>}
  </>;
}
