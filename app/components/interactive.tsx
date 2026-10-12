"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { content, event } from "../event";
import { getCountdown } from "../countdown";
import { ease, useMotionPreference } from "./motion";
import { RegistrationCTA } from "./ui";
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!event.startsAt || !event.endsAt) return;
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const { state, values } = getCountdown(now, event.startsAt, event.endsAt);
  const titles: Record<string, string> = {
    unconfirmed: "The countdown begins soon",
    upcoming: "The Summit Begins In",
    live: "YELS 2026 Is Live",
    ended: "YELS 2026 Has Concluded",
  };
  const reveal = (delay: number, y = 22) => ({ initial: { opacity: 0, y: reduced ? 0 : y }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease } });
  const showTimer = state === "upcoming" || state === "unconfirmed";
  return (
    <section className="countdown-strip" aria-label="Summit countdown">
      <span className="countdown-ghost" aria-hidden="true">2026</span>
      <div className="countdown-inner">
        <motion.p className="countdown-kicker" {...reveal(0)}>YELS 2026</motion.p>
        <motion.div className="countdown-heading-mask" {...reveal(0.1, 34)}><h2 className="countdown-title">{titles[state]}</h2></motion.div>
        {showTimer ? <div className="countdown-digits" aria-live="off">{["Days", "Hours", "Minutes", "Seconds"].map((label, i) => <div className="countdown-unit" key={label}><motion.span {...reveal(0.18 + i * 0.08, 70)}>{values[i]}</motion.span><motion.small {...reveal(0.28 + i * 0.08, 10)}>{label}</motion.small>{i < 3 && <i className="countdown-colon" aria-hidden="true">:</i>}</div>)}</div> : <motion.p className="countdown-state" {...reveal(0.24, 50)}>{state === "ended" ? "THANK YOU" : "YELS 2026"}</motion.p>}
        <motion.div className="countdown-cta" {...reveal(0.64)}><RegistrationCTA /></motion.div>
        <motion.p className="countdown-note" {...reveal(0.82, 8)}>
          {state === "unconfirmed"
            ? "Summit date announcement coming soon."
            : state === "ended"
              ? "Thank you for being part of YELS 2026."
              : state === "live"
                ? "A generation coming together to lead."
                : `${event.dateLabel} · ${event.location}`}
        </motion.p>
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
