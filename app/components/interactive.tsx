"use client";
import { useEffect, useState } from "react";
import { content, event } from "../event";
import { getCountdown } from "../countdown";
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!event.startsAt || !event.endsAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const { state, values } = getCountdown(now, event.startsAt, event.endsAt);
  const titles: Record<string, string> = {
    unconfirmed: "The countdown begins soon",
    upcoming: "The future is getting closer",
    live: "The summit is live",
    ended: "The summit has concluded",
  };
  return (
    <section className="countdown-strip" aria-label="Summit countdown">
      <div className="container countdown-inner">
        <p className="countdown-title">{titles[state]}</p>
        <div className="countdown-digits" aria-live="off">
          {["Days", "Hours", "Minutes", "Seconds"].map((label, i) => (
            <div key={label}>
              <span>{values[i]}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <p className="countdown-note">
          {state === "unconfirmed"
            ? "Summit date announcement coming soon."
            : state === "ended"
              ? "Thank you for being part of YELS 2026."
              : state === "live"
                ? "A generation coming together to lead."
                : "Counting down to YELS 2026."}
        </p>
      </div>
    </section>
  );
}
export function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {content.faqs.map((faq, i) => (
        <div className="faq-item" key={faq.question}>
          <h3>
            <button
              id={`question-${i}`}
              aria-expanded={expanded === i}
              aria-controls={`answer-${i}`}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              {faq.question}
              <span aria-hidden="true">{expanded === i ? "−" : "+"}</span>
            </button>
          </h3>
          <div
            id={`answer-${i}`}
            role="region"
            aria-labelledby={`question-${i}`}
            hidden={expanded !== i}
          >
            <p>{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
