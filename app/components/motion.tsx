"use client";
import { motion, useAnimationControls, type Variants } from "framer-motion";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
const subscribeMotionPreference = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const readMotionPreference = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotionPreference = () => false;
// Use the same server snapshot during hydration, then subscribe to the real preference.
export function useMotionPreference() {
  return useSyncExternalStore(
    subscribeMotionPreference,
    readMotionPreference,
    serverMotionPreference,
  );
}
export const ease = [0.22, 1, 0.36, 1] as const;
export const textReveal: Variants = {
  enter: (delay = 0) => ({
    opacity: [0, 1],
    y: [24, 0],
    transition: { duration: 0.65, delay, ease },
  }),
};
export const stagger: Variants = {
  enter: { transition: { staggerChildren: 0.1 } },
};
// SSR and failed-JS output stay visible; keyframe reveals enhance existing content.
export function Reveal({
  children,
  className = "",
  delay = 0,
  kind = "section",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  kind?: "section" | "image" | "speaker" | "agenda";
}) {
  const reduced = useMotionPreference();
  const variants: Variants = {
    enter: {
      opacity: reduced ? 1 : [0, 1],
      y: reduced ? 0 : [kind === "image" ? 12 : 24, 0],
      scale: kind === "image" && !reduced ? [1.025, 1] : 1,
      transition: { duration: 0.65, delay: reduced ? 0 : delay, ease },
    },
  };
  return (
    <motion.div
      className={className}
      initial={false}
      variants={variants}
      whileInView="enter"
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}
type HeroTiming = { delay: number; duration: number; distance?: number | string };
const heroReveal: Variants = {
  hidden: ({ distance = 12 }: HeroTiming) => ({ opacity: 0, y: distance }),
  visible: ({ delay, duration }: HeroTiming) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration, ease },
  }),
};
const heroArtwork: Variants = {
  hidden: { opacity: 0, y: 20, scale: 1.03 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 1.05, duration: 0.95, ease },
  },
};
export function HeroSequence({
  artwork,
  children,
}: {
  artwork: ReactNode;
  children: ReactNode;
}) {
  const controls = useAnimationControls();
  const reduced = useMotionPreference();
  useEffect(() => {
    // Read the actual preference before starting the hydration-safe timeline.
    if (readMotionPreference()) controls.set("visible");
    else void controls.start("visible");
  }, [controls]);
  useEffect(() => {
    // Changing the preference can stop motion, but never replays the entrance.
    if (reduced) controls.set("visible");
  }, [controls, reduced]);
  return (
    <motion.section
      className="hero"
      aria-labelledby="hero-heading"
      initial="hidden"
      animate={controls}
    >
      <noscript>
        <style>{`
          .hero .hero-reveal, .hero .hero-artwork-ambient {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      <div className="container hero-layout">{children}</div>
      <div className="hero-artwork" aria-hidden="true">
        <motion.div className="hero-artwork-entrance hero-reveal" variants={heroArtwork}>
          <motion.div
            className="hero-artwork-ambient"
            animate={
              reduced
                ? { y: 0, rotate: 0 }
                : { y: [0, -10, 0], rotate: [0, 1, 0] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2.05 }
            }
          >
            {artwork}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
export function HeroText({
  eyebrow,
  heading,
  subtitle,
  description,
  cta,
}: {
  eyebrow: string;
  heading: [string, string, string];
  subtitle: string;
  description: string;
  cta: ReactNode;
}) {
  return (
    <div className="hero-copy">
      <motion.p
        className="eyebrow hero-location hero-reveal"
        variants={heroReveal}
        custom={{ delay: 0.08, duration: 0.45 }}
      >
        <svg className="hero-location-pin" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
        <span>{eyebrow}</span>
      </motion.p>
      <div className="hero-text-row">
        <h1 id="hero-heading">
          {heading.map((line, i) => (
            <span className="hero-line-mask" key={line}>
              <motion.span
                className="hero-line hero-reveal"
                variants={heroReveal}
                custom={{ delay: 0.18 + i * 0.1, duration: 0.7, distance: "105%" }}
              >
                {i === 0 ? (
                  <>
                    <span className="hero-first-word">{line.split(" ")[0]}{" "}</span>
                    {line.slice(line.indexOf(" ") + 1)}
                  </>
                ) : i === 2 ? (
                  <>
                    <span className="hero-dash" aria-hidden="true">&mdash; </span>
                    {line.slice(0, -4)}<em>2026</em>
                  </>
                ) : line}
                {" "}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className="hero-support">
          <motion.h2
            className="hero-theme hero-reveal"
            variants={heroReveal}
            custom={{ delay: 0.55, duration: 0.55 }}
          >
            {subtitle}
          </motion.h2>
          <motion.p
            className="hero-description hero-reveal"
            variants={heroReveal}
            custom={{ delay: 0.65, duration: 0.55 }}
          >
            {description}
          </motion.p>
          <motion.div
            className="hero-actions hero-reveal"
            variants={heroReveal}
            custom={{ delay: 0.75, duration: 0.55 }}
          >
            {cta}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
