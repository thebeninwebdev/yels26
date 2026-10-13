"use client";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls, type Variants } from "framer-motion";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
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
  visible: ({ delay, duration, distance = 12 }: HeroTiming) => ({
    opacity: [0, 1],
    y: [distance, 0],
    transition: { delay, duration, ease },
  }),
};
const heroArtwork: Variants = {
  visible: {
    opacity: [0, 1],
    y: [20, 0],
    scale: [1.03, 1],
    transition: { delay: 0.28, duration: 0.8, ease },
  },
};
const heroBackground: Variants = {
  visible: {
    opacity: [0, 1],
    scale: [1.03, 1],
    transition: { delay: 0.02, duration: 1.5, ease },
  },
};
const INTRO_MARKER = "yelsIntroPlayed";
const INTRO_WORD_DURATION = 1.15;
const INTRO_YELS_DELAY = 0.18;
const INTRO_YEAR_DELAY = 0.42;
const INTRO_EXIT_AT = 1650;
const HERO_REVEAL_AT = 1750;
const SCROLL_RESTORE_AT = 2600;
const INTRO_SAFETY_AT = 3300;
export function HeroSequence({
  artwork,
  children,
  introTitle,
}: {
  artwork: ReactNode;
  children: ReactNode;
  introTitle?: string;
}) {
  const controls = useAnimationControls();
  const reduced = useMotionPreference();
  // Keep the overlay in the server HTML so the first paint is never the homepage.
  const [introVisible, setIntroVisible] = useState(Boolean(introTitle));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    let scrollLocked = false;
    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      scrollLocked = true;
    };
    const restoreScroll = () => {
      if (!scrollLocked) return;
      document.body.style.overflow = previousOverflow;
      scrollLocked = false;
    };

    let exitIntro: number | undefined;
    let revealHero: number | undefined;
    let restoreIntroScroll: number | undefined;
    let safetyTimer: number | undefined;

    const showHero = () => {
      controls.set("visible");
    };
    const failOpen = () => {
      setIntroVisible(false);
      showHero();
      restoreScroll();
    };

    try {
      const alreadyPlayed = document.documentElement.dataset[INTRO_MARKER] === "true";
      if (!introTitle || reduced || alreadyPlayed) {
        failOpen();
      } else {
        lockScroll();
        exitIntro = window.setTimeout(() => setIntroVisible(false), INTRO_EXIT_AT);
        revealHero = window.setTimeout(() => void controls.start("visible"), HERO_REVEAL_AT);
        restoreIntroScroll = window.setTimeout(restoreScroll, SCROLL_RESTORE_AT);
        safetyTimer = window.setTimeout(failOpen, INTRO_SAFETY_AT);
      }
    } catch (error) {
      console.error("Unable to prepare the YELS intro", error);
      failOpen();
    }

    return () => {
      window.clearTimeout(exitIntro);
      window.clearTimeout(revealHero);
      window.clearTimeout(restoreIntroScroll);
      window.clearTimeout(safetyTimer);
      restoreScroll();
    };
  }, [controls, introTitle, reduced]);

  return (
    <>
      <AnimatePresence onExitComplete={() => { document.documentElement.dataset[INTRO_MARKER] = "true"; }}>
        {introTitle && introVisible && !reduced && (
          <motion.div className="yels-intro" initial={{ y: 0 }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}>
            <motion.div className="yels-intro-inner" exit={{ y: -52, scale: 1.02 }} transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}>
              <h1 className="yels-intro-title" aria-label={introTitle}>
                <span className="yels-intro-mask"><motion.span className="yels-intro-word" initial={{ opacity: 0, y: "105%" }} animate={{ opacity: 1, y: 0 }} transition={{ duration: INTRO_WORD_DURATION, delay: INTRO_YELS_DELAY, ease }}>YELS</motion.span></span>
                <span className="yels-intro-mask"><motion.span className="yels-intro-year" initial={{ opacity: 0, y: "105%" }} animate={{ opacity: 1, y: 0 }} transition={{ duration: INTRO_WORD_DURATION, delay: INTRO_YEAR_DELAY, ease }}>26</motion.span></span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.section className="hero" aria-labelledby="hero-heading" initial={false} animate={controls}>
      <noscript>
        <style>{`
          .yels-intro { display: none !important; }
          .hero .hero-reveal, .hero .hero-artwork-ambient, .hero .hero-background {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      <motion.div className="hero-background" variants={heroBackground} aria-hidden="true">
        <Image
          src="/images/yels-hero.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="hero-background-image"
        />
      </motion.div>
      <div className="hero-background-overlay" aria-hidden="true" />
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
    </>
  );
}
export function HeroText({
  eyebrow,
  heading,
  description,
  cta,
}: {
  eyebrow: string;
  heading: [string, string, string];
  description: string;
  cta: ReactNode;
}) {
  return (
    <div className="hero-copy">
      <motion.p
        className="eyebrow hero-location hero-reveal"
        variants={heroReveal}
        custom={{ delay: 0.05, duration: 0.42 }}
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
                custom={{ delay: 0.12 + i * 0.1, duration: 0.62, distance: "105%" }}
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
          <motion.p
            className="hero-description hero-reveal"
            variants={heroReveal}
            custom={{ delay: 0.4, duration: 0.5 }}
          >
            {description}
          </motion.p>
          <motion.div
            className="hero-actions hero-reveal"
            variants={heroReveal}
            custom={{ delay: 0.55, duration: 0.5 }}
          >
            {cta}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
