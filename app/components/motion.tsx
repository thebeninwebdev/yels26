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
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      void controls.start("enter");
  }, [controls]);
  return (
    <motion.section
      className="hero"
      aria-labelledby="hero-heading"
      initial={false}
      animate={controls}
    >
        <motion.div
          className="hero-artwork"
          aria-hidden="true"
          variants={{
            enter: {
              opacity: [0, 1],
              scale: [1.04, 1],
              transition: { delay: 1.65, duration: 1, ease },
            },
          }}
        >
          <motion.div
            animate={
              reduced
                ? { y: 0, rotate: 0 }
                : { y: [0, -10, 0], rotate: [-1, 1, -1] }
            }
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2.2,
            }}
          >
            {artwork}
          </motion.div>
        </motion.div>
      <div className="container hero-layout">
        {children}
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
  heading: string[];
  subtitle: string;
  description: string;
  cta: ReactNode;
}) {
  return (
    <div className="hero-copy">
      <motion.p className="eyebrow" variants={textReveal} custom={0.08}>
        {eyebrow}
      </motion.p>
      <motion.h1 id="hero-heading" variants={stagger}>
        {heading.map((line, i) => (
          <motion.span key={line} variants={textReveal} custom={0.16 + i * 0.1}>
            {line === "SUMMIT 2026" ? (
              <>
                SUMMIT <em>2026</em>
              </>
            ) : (
              line
            )}
          </motion.span>
        ))}
      </motion.h1>
      <motion.h2 className="hero-theme" variants={textReveal} custom={0.65}>
        {subtitle}
      </motion.h2>
      <motion.p
        className="hero-description"
        variants={textReveal}
        custom={0.76}
      >
        {description}
      </motion.p>
      <motion.div className="hero-actions" variants={textReveal} custom={0.87}>
        {cta}
      </motion.div>
    </div>
  );
}
