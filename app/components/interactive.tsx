"use client";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { content, event } from "../event";
import { getCountdown } from "../countdown";
import { ease, useMotionPreference } from "./motion";
import { RegistrationCTA } from "./ui";
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!event.startsAt) return;
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
  const parent = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: reduced ? 0 : 0.05 } } };
  const item = (y = 32) => ({ hidden: { opacity: 0, y: reduced ? 0 : y }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.7, ease } } });
  const showTimer = state === "upcoming" || state === "unconfirmed";
  return (
    <section className="countdown-strip" aria-label="Summit countdown">
      <span className="countdown-ghost" aria-hidden="true">2026</span>
      <motion.div className="countdown-inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={parent}>
        <motion.p className="countdown-kicker" variants={item(16)}>YELS 2026</motion.p>
        <motion.div className="countdown-heading-mask" variants={item(34)}><h2 className="countdown-title">{titles[state]}</h2></motion.div>
        {showTimer ? <div className="countdown-digits" aria-live="off">{["Days", "Hours", "Minutes", "Seconds"].map((label, i) => <Fragment key={label}><motion.div className="countdown-unit" variants={item(60)}><span className="countdown-number">{values[i]}</span><small>{label}</small></motion.div>{i < 3 && <motion.span className="countdown-colon" aria-hidden="true" variants={item(12)}>:</motion.span>}</Fragment>)}</div> : <motion.p className="countdown-state" variants={item(50)}>{state === "ended" ? "THANK YOU" : "YELS 2026"}</motion.p>}
        <motion.div className="countdown-cta" variants={item(18)}><RegistrationCTA /></motion.div>
        <motion.p className="countdown-note" variants={item(8)}>
          {state === "unconfirmed"
            ? "Summit details announcement coming soon."
            : state === "ended"
              ? "Thank you for being part of YELS 2026."
              : state === "live"
                ? "A generation coming together to lead."
                : `${event.dateLabel} · ${event.location}`}
        </motion.p>
      </motion.div>
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
