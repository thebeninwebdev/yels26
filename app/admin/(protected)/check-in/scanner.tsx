"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./scanner.module.css";
type ScannerStatus = "idle" | "starting" | "scanning" | "processing" | "result";
type Attendee = { fullName: string; registrationId: string; participantType: string; checkedInAt?: string };
type Result = { kind: "success" | "warning" | "error"; title: string; message: string; attendee?: Attendee; retryable?: boolean };
type RecentCheckIn = { name: string; checkedInAt: string };
type Submission = { value: string; manualEntry: boolean };
const REQUEST_TIMEOUT = 12_000;

export function CheckInScanner({ initialCheckedIn, total, recent }: { initialCheckedIn: number; total: number; recent: RecentCheckIn[] }) {
  const video = useRef<HTMLVideoElement>(null), controls = useRef<{ stop: () => void } | null>(null), processing = useRef(false), lastSubmission = useRef<Submission | null>(null);
  const [status, setStatus] = useState<ScannerStatus>("idle"), [cameraError, setCameraError] = useState(""), [result, setResult] = useState<Result | null>(null), [manual, setManual] = useState(""), [checkedIn, setCheckedIn] = useState(initialCheckedIn), [recentCheckIns, setRecentCheckIns] = useState(recent);
  const busy = status === "starting" || status === "processing", cameraActive = status === "starting" || status === "scanning";
  const stopCamera = () => { controls.current?.stop(); controls.current = null; const stream = video.current?.srcObject; if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop()); if (video.current) video.current.srcObject = null; };
  useEffect(() => () => stopCamera(), []);
  const showResult = (next: Result) => { setResult(next); setStatus("result"); };
  const submit = async (value: string, manualEntry = false) => {
    if (processing.current) return;
    processing.current = true; lastSubmission.current = { value, manualEntry }; setCameraError(""); setStatus("processing"); stopCamera();
    const controller = new AbortController(), timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch("/api/admin/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify(manualEntry ? { registrationId: value.trim().toUpperCase() } : { qrPayload: value }) });
      const data = await response.json();
      if (data.success) { const attendee = data.attendee as Attendee; setCheckedIn((count) => count + 1); setRecentCheckIns((items) => [{ name: attendee.fullName, checkedInAt: attendee.checkedInAt ?? new Date().toISOString() }, ...items.filter((item) => item.name !== attendee.fullName)].slice(0, 5)); navigator.vibrate?.(100); showResult({ kind: "success", title: "Checked in", message: "Entry confirmed.", attendee }); }
      else if (data.code === "ALREADY_CHECKED_IN") showResult({ kind: "warning", title: "Already checked in", message: "This ticket was already used.", attendee: data.attendee });
      else { const invalid = data.code === "INVALID_TICKET" || data.code === "TICKET_NOT_FOUND"; showResult({ kind: "error", title: invalid ? "Ticket not valid" : "Check-in unavailable", message: invalid ? "This QR code does not match an active YELS 2026 registration." : data.code === "REGISTRATION_CANCELLED" ? "This registration has been cancelled." : "This ticket could not be checked in. Please try another ticket." }); }
    } catch (error) { const timedOut = error instanceof DOMException && error.name === "AbortError"; showResult({ kind: "error", title: timedOut ? "Check-in is taking too long" : "Check-in failed", message: timedOut ? "We could not confirm whether this attendee was checked in. Check your connection before trying again." : "We couldn't reach the server. The attendee has not been confirmed as checked in. Check your connection and try again.", retryable: true }); }
    finally { window.clearTimeout(timeout); }
  };
  const start = async () => {
    if (processing.current || status === "starting") return;
    setCameraError(""); setResult(null); setStatus("starting");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) { setCameraError("Camera access is unavailable on this device or browser. Use manual check-in instead."); setStatus("idle"); return; }
    const videoElement = video.current;
    if (!videoElement) { setCameraError("Camera preview is not ready. Please try again."); setStatus("idle"); return; }
    try { const { BrowserQRCodeReader } = await import("@zxing/browser"); const reader = new BrowserQRCodeReader(); controls.current = await reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoElement, (scan) => { if (!scan || processing.current) return; void submit(scan.getText()); }); await videoElement.play().catch(() => undefined); setStatus("scanning"); }
    catch (error) { setCameraError(error instanceof DOMException && error.name === "NotAllowedError" ? "Camera access is unavailable. Allow camera permission in your browser, or use the registration ID below." : "No camera was detected on this device. Use manual check-in instead."); stopCamera(); setStatus("idle"); }
  };
  const stop = () => { if (!busy) { stopCamera(); setStatus("idle"); } };
  const next = () => { setResult(null); setManual(""); processing.current = false; void start(); };
  const retry = () => { const previous = lastSubmission.current; if (!previous) return; processing.current = false; void submit(previous.value, previous.manualEntry); };
  const onManual = (event: FormEvent) => { event.preventDefault(); if (manual.trim() && !busy && !processing.current) void submit(manual, true); };
  const time = (value?: string) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const statusCopy = status === "starting" ? "Starting camera…" : status === "scanning" ? "Ready to scan" : "Scanner stopped";
  return <div className="admin-checkin-grid"><section className="admin-scanner-panel"><div className={`admin-video-wrap ${styles.wrap}`}><video ref={video} className={`admin-video ${styles.video} ${cameraActive ? styles.videoActive : ""}`} playsInline muted autoPlay />{status === "idle" && !result && <div className={`admin-camera-placeholder ${styles.placeholder}`}>Camera ready when you are</div>}{status === "scanning" && <span className="admin-scan-frame" aria-hidden="true" />}{status === "processing" && <div className={styles.processing} role="status" aria-live="polite"><i className={styles.spinner} aria-hidden="true" /><b>Processing ticket</b><p>Verifying registration and checking attendee in…</p><small>Please wait. Do not scan another ticket yet.</small></div>}{result && <div className={`admin-scan-result ${result.kind} ${styles.result} ${styles[result.kind]}`} role={result.kind === "error" ? "alert" : "status"} aria-live="polite"><b>{result.kind === "success" ? "✓" : result.kind === "warning" ? "!" : "×"}</b><p>{result.title}</p>{result.attendee && <><h2>{result.attendee.fullName}</h2><span>{result.attendee.registrationId}</span><small>{result.attendee.participantType}{result.attendee.checkedInAt ? ` · Checked in at ${time(result.attendee.checkedInAt)}` : ""}</small></>}<em>{result.message}</em>{result.retryable && <button className={`admin-button ${styles.button} ${styles.retry}`} onClick={retry} disabled={busy}>Try again</button>}<button className={`admin-button ${styles.button}`} onClick={next} disabled={busy}>{result.retryable ? "Scan another ticket" : "Scan next ticket"}</button></div>}</div>{!result && <><div className={`${styles.status} ${status === "scanning" ? styles.ready : status === "starting" ? styles.starting : ""}`} aria-live="polite"><i aria-hidden="true" />{statusCopy}{status === "scanning" && <small>Hold the attendee&apos;s QR code inside the frame.</small>}</div>{cameraError && <p className="admin-camera-error" role="alert">{cameraError}</p>}<div className="admin-scanner-actions">{status === "scanning" ? <button className="admin-button admin-stop" onClick={stop} disabled={busy}>Stop scanner</button> : <button className="admin-button" onClick={() => void start()} disabled={busy}>{status === "starting" ? "Starting…" : "Start scanner"}</button>}<span>Point the attendee&apos;s YELS 2026 ticket QR code at the camera.</span></div></>}</section><aside className="admin-checkin-side"><section className="admin-panel"><header className="admin-panel-head"><h2>Manual check-in</h2></header><form className="admin-manual-form" onSubmit={onManual}><label>Can&apos;t scan the QR?<input value={manual} onChange={(event) => setManual(event.target.value.toUpperCase())} placeholder="YELS26-________" disabled={busy} /></label><button className="admin-button" disabled={busy}>{status === "processing" ? "Processing…" : "Check in manually"}</button></form></section><section className="admin-panel"><header className="admin-panel-head"><h2>Recent check-ins</h2><span>{checkedIn} / {total}</span></header><div className="admin-recent-checkins">{recentCheckIns.length ? recentCheckIns.map((item) => <p key={`${item.name}-${item.checkedInAt}`}><span>{item.name}</span><small>{time(item.checkedInAt)}</small></p>) : <p className="admin-table-muted">No guests checked in yet.</p>}</div></section></aside></div>;
}
