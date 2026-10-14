"use client";

import { motion, type Variants } from "framer-motion";
import { useMotionPreference } from "./motion";

const slotEase = [0.16, 1, 0.3, 1] as const;

const wordVariants: Variants = {
  hidden: { y: "115%", opacity: 0, filter: "blur(6px)", scale: 0.96 },
  visible: (delay: number) => ({
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.74, delay, ease: slotEase },
  }),
};

const periodVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: [0, 1.12, 1],
    transition: { duration: 0.26, delay, ease: slotEase },
  }),
};

export function AudienceWordReveal({ audience, index }: { audience: string; index: number }) {
  const reduced = useMotionPreference();
  const words = audience.split(" ");
  const isMultiWord = words.length > 1;
  const isLong = audience === "Private-sector practitioners";
  const itemDelay = index * 0.085;

  return (
    <li className="audience-item">
      <motion.span
        className={`audience-word${isMultiWord ? " audience-word--multi" : ""}${isLong ? " audience-word--long" : ""}`}
        initial={reduced ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        {words.map((word, wordIndex) => (
          <span className="audience-mask" key={word}>
            <motion.span
              className="audience-word-part"
              variants={wordVariants}
              custom={reduced ? 0 : itemDelay + wordIndex * 0.085}
            >
              {word}
            </motion.span>
          </span>
        ))}
        <motion.span
          className="audience-period"
          variants={periodVariants}
          custom={reduced ? 0 : itemDelay + words.length * 0.085 + 0.06}
        >
          .
        </motion.span>
      </motion.span>
    </li>
  );
}
