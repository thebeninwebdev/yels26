"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./scanner.module.css";
import stateStyles from "./scanner-states.module.css";

type ScannerState =
  | "requesting-camera"
  | "scanning"
  | "verifying"
  | "attendee-found"
  | "checking-in"
  | "checked-in"
  | "already-checked-in"
  | "invalid"
  | "camera-error"
  | "network-error";
type Tab = "scanner" | "recent";
type Attendee = {
  fullName: string;
  registrationId: string;
  participantType: string;
  bootcampApplied: boolean;
  bootcampStatus: string;
  checkedInAt?: string;
};
type RecentCheckIn = { name: string; checkedInAt: string };
const TIMEOUT = 12_000;

function CameraIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 11h5l-1 9 8-12h-5V2Z" /></svg>;
}

export function CheckInScanner({ initialCheckedIn, total, recent }: { initialCheckedIn: number; total: number; recent: RecentCheckIn[] }) {
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<{ stop: () => void } | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const locked = useRef(false);
  const [tab, setTab] = useState<Tab>("scanner");
  const [state, setState] = useState<ScannerState>("requesting-camera");
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [message, setMessage] = useState("");
  const [recentCheckIns, setRecentCheckIns] = useState(recent);
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [torch, setTorch] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  const stopCamera = () => {
    controls.current?.stop();
    controls.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  };

  useEffect(() => () => stopCamera(), []);

  const clock = (value?: string) => value
    ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

  const request = async (body: object) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return { data: await response.json() };
    } finally {
      window.clearTimeout(timer);
    }
  };

  const verify = async (payload: string, manualEntry = false) => {
    if (locked.current) return;
    locked.current = true;
    stopCamera();
    setState("verifying");
    setMessage("");
    try {
      const { data } = await request(manualEntry
        ? { registrationId: payload.trim().toUpperCase(), action: "verify" }
        : { qrPayload: payload, action: "verify" });
      if (data.success) {
        setAttendee(data.attendee);
        setState("attendee-found");
      } else if (data.code === "ALREADY_CHECKED_IN") {
        setAttendee(data.attendee);
        setState("already-checked-in");
      } else {
        setState("invalid");
        setMessage(data.code === "REGISTRATION_CANCELLED"
          ? "This registration has been cancelled."
          : "This QR code does not match a valid YELS 2026 registration.");
      }
    } catch {
      setState("network-error");
      setMessage("We couldn’t verify this ticket. Check your connection and try again.");
    }
  };

  const startCamera = async () => {
    stopCamera();
    locked.current = false;
    setAttendee(null);
    setMessage("");
    setState("requesting-camera");
    if (!navigator.mediaDevices?.getUserMedia || !video.current) {
      setState("camera-error");
      return;
    }
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      controls.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        video.current,
        (scan) => { if (scan && !locked.current) void verify(scan.getText()); },
      );
      stream.current = video.current.srcObject instanceof MediaStream ? video.current.srcObject : null;
      const capabilities = stream.current?.getVideoTracks()[0]?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean } | undefined;
      setTorchAvailable(Boolean(capabilities?.torch));
      await video.current.play().catch(() => undefined);
      setState("scanning");
    } catch {
      stopCamera();
      setState("camera-error");
    }
  };

  useEffect(() => {
    if (tab === "recent") {
      stopCamera();
      return;
    }
    const timer = window.setTimeout(() => { void startCamera(); }, 0);
    return () => window.clearTimeout(timer);
  }, [tab]);

  const checkIn = async () => {
    if (!attendee) return;
    setState("checking-in");
    try {
      const { data } = await request({ registrationId: attendee.registrationId, action: "check-in" });
      if (data.success) {
        const checked = data.attendee as Attendee;
        setAttendee(checked);
        setCheckedIn((count) => count + 1);
        setRecentCheckIns((items) => [
          { name: checked.fullName, checkedInAt: checked.checkedInAt ?? new Date().toISOString() },
          ...items.filter((item) => item.name !== checked.fullName),
        ].slice(0, 20));
        navigator.vibrate?.(100);
        setState("checked-in");
      } else if (data.code === "ALREADY_CHECKED_IN") {
        setAttendee(data.attendee);
        setState("already-checked-in");
      } else {
        setMessage("We couldn’t complete check-in. Please try again.");
        setState("network-error");
      }
    } catch {
      setMessage("We couldn’t complete check-in. Check your connection and try again.");
      setState("network-error");
    }
  };

  const toggleTorch = async () => {
    const track = stream.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      setTorchAvailable(false);
    }
  };

  const resultVisible = !["scanning", "requesting-camera", "camera-error", "verifying", "checking-in"].includes(state);

  return <div className={`${styles.shell} checkin-shell`}>
    <main className={`${styles.stage} checkin-stage`}>
      {tab === "scanner" ? <>
        <section className={`${styles.cameraCard} checkin-camera-card`}>
          <video ref={video} className={`${styles.video} checkin-video`} playsInline muted autoPlay />
          {(["scanning", "requesting-camera"] as ScannerState[]).includes(state) && <>
            <div className={`${styles.shade} checkin-shade`} />
            <motion.div className={`${styles.target} checkin-target`} initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}><i /><i /><i /><i /><span /></motion.div>
            <div className={`${styles.instructions} checkin-instructions`}><b>{state === "requesting-camera" ? "Starting camera" : "Scan attendee QR"}</b><small>Position the ticket QR code inside the frame.</small></div>
            {state === "scanning" && torchAvailable && <div className={`${styles.cameraControls} checkin-camera-controls`}>
              <button className={`${styles.roundControl} ${torch ? styles.active : ""}`} onClick={() => void toggleTorch()} aria-label="Toggle flash"><CameraIcon /></button>
            </div>}
          </>}
          {state === "camera-error" && <Result icon="!" title="Camera access required" copy="Allow camera access to scan attendee tickets, then try again." action="Try camera again" onAction={() => void startCamera()} />}
          {state === "verifying" && <LoadingState title="Verifying ticket" copy="Checking this YELS 2026 registration…" />}
          {state === "checking-in" && <LoadingState title="Checking in attendee" copy={attendee ? `Saving ${attendee.fullName}'s arrival…` : "Saving check-in…"} />}
          <AnimatePresence mode="wait">{resultVisible && <motion.div className={styles.resultWrap} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Result
              icon={state === "checked-in" || state === "attendee-found" ? "✓" : state === "already-checked-in" ? "!" : "×"}
              title={state === "attendee-found" ? "Attendee found" : state === "checked-in" ? "Checked in" : state === "already-checked-in" ? "Already checked in" : state === "invalid" ? "Ticket not recognised" : "Check-in unavailable"}
              copy={state === "checked-in" && attendee ? `${attendee.fullName} checked in at ${clock(attendee.checkedInAt)}.` : state === "already-checked-in" && attendee ? `${attendee.fullName} was checked in at ${clock(attendee.checkedInAt)}.` : message}
              attendee={attendee}
              action={state === "attendee-found" ? "Check in attendee" : state === "checked-in" ? "Scan next attendee" : state === "invalid" ? "Try again" : "Scan another ticket"}
              onAction={state === "attendee-found" ? () => void checkIn() : () => void startCamera()}
              busy={state === "checking-in"}
            />
          </motion.div>}</AnimatePresence>
        </section>
      </> : <RecentView items={recentCheckIns} checkedIn={checkedIn} total={total} clock={clock} />}
    </main>

    <nav className={`${styles.bottomNav} checkin-bottom-nav`} aria-label="Check-in views" role="tablist">
      <button className={tab === "scanner" ? "checkin-tab-active" : ""} onClick={() => setTab("scanner")} role="tab" aria-selected={tab === "scanner"}>Scan QR</button>
      <button className={tab === "recent" ? "checkin-tab-active" : ""} onClick={() => setTab("recent")} role="tab" aria-selected={tab === "recent"}>Recent <span>{checkedIn}/{total}</span></button>
    </nav>

  </div>;
}

function RecentView({ items, checkedIn, total, clock }: { items: RecentCheckIn[]; checkedIn: number; total: number; clock: (value?: string) => string }) {
  return <section className="checkin-recent-view" aria-labelledby="recent-checkins-heading">
    <header><div><p>EVENT ACTIVITY</p><h1 id="recent-checkins-heading">Recent check-ins</h1></div><strong>{checkedIn}<small> / {total}</small></strong></header>
    <div className="checkin-recent-list">{items.length ? items.map((item, index) => <article key={`${item.name}-${item.checkedInAt}`}>
      <span aria-hidden="true">✓</span><div><b>{item.name}</b><small>Successfully checked in</small></div><time>{clock(item.checkedInAt)}</time><i>{String(index + 1).padStart(2, "0")}</i>
    </article>) : <div className="checkin-recent-empty"><span>✓</span><h2>No check-ins yet</h2><p>Completed check-ins will appear here.</p></div>}</div>
  </section>;
}

function LoadingState({ title, copy }: { title: string; copy: string }) {
  return <div className={`${styles.loading} ${stateStyles.loadingState}`} role="status" aria-live="polite"><i /><b>{title}</b><small>{copy}</small></div>;
}

function Result({ icon, title, copy, attendee, action, onAction, busy, secondary, secondaryLabel }: { icon: string; title: string; copy?: string; attendee?: Attendee | null; action: string; onAction: () => void; busy?: boolean; secondary?: () => void; secondaryLabel?: string }) {
  const tone = title === "Checked in" || title === "Attendee found" ? stateStyles.success : title === "Already checked in" ? stateStyles.warning : stateStyles.error;
  return <div className={`${styles.result} ${tone}`} role={tone === stateStyles.error ? "alert" : "status"} aria-live="polite">
    <b className={styles.resultIcon}>{icon}</b>
    <p>{title}</p>
    {attendee && <div className={styles.attendee}><strong>{attendee.fullName}</strong><dl>
      <div><dt>Registration</dt><dd>{attendee.registrationId}</dd></div>
      <div><dt>Type</dt><dd>{attendee.participantType}</dd></div>
      <div><dt>Bootcamp</dt><dd>{attendee.bootcampApplied ? attendee.bootcampStatus.replaceAll("_", " ") : "Not applied"}</dd></div>
      {attendee.checkedInAt && <div><dt>Check-in</dt><dd>{new Date(attendee.checkedInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</dd></div>}
    </dl></div>}
    {copy && <small>{copy}</small>}
    <button className={styles.primary} onClick={onAction} disabled={busy}>{busy ? "Checking in…" : action}</button>
    {secondary && <button className={styles.secondary} onClick={secondary}>{secondaryLabel}</button>}
  </div>;
}
