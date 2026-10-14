"use client";

import { motion, type Variants } from "framer-motion";
import { content } from "../event";
import { ease, useMotionPreference } from "./motion";

type PanelKind = "before" | "after";

function TransformationPanel({
  kind,
  reduced,
}: {
  kind: PanelKind;
  reduced: boolean;
}) {
  const after = kind === "after";
  const panelVariants: Variants = {
    visible: {
      opacity: reduced ? 1 : [0, 1],
      y: reduced ? 0 : [16, 0],
      transition: {
        delay: reduced ? 0 : after ? 0.3 : 0.16,
        duration: 0.58,
        ease,
      },
    },
  };
  const rowVariants: Variants = {
    visible: (index: number) => ({
      opacity: reduced ? 1 : [0, 1],
      y: reduced ? 0 : [10, 0],
      transition: {
        delay: reduced ? 0 : (after ? 0.4 : 0.34) + index * 0.1,
        duration: 0.42,
        ease,
      },
    }),
  };

  return (
    <motion.article
      className={`transformation-panel transformation-${kind}`}
      variants={panelVariants}
    >
      <h3 className="transformation-label">
        {after ? "AFTER YELS" : "BEFORE YELS"}
      </h3>
      <div className="transformation-rows" role="list">
        {content.transformation.map((item, index) => (
          <motion.div
            className="transformation-row"
            custom={index}
            key={item.before}
            role="listitem"
            variants={rowVariants}
          >
            <span className="transformation-dot" aria-hidden="true" />
            <p>{item[kind]}</p>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

export function YelsTransformation() {
  const reduced = useMotionPreference();
  const editorialVariants: Variants = {
    visible: (delay: number) => ({
      opacity: reduced ? 1 : [0, 1],
      y: reduced ? 0 : [18, 0],
      transition: { delay: reduced ? 0 : delay, duration: 0.55, ease },
    }),
  };
  const arrowVariants: Variants = {
    visible: {
      opacity: reduced ? 1 : [0, 1],
      scale: reduced ? 1 : [0.8, 1],
      transition: { delay: reduced ? 0 : 0.24, duration: 0.42, ease },
    },
  };

  return (
    <motion.section
      id="transformation"
      className="yels-transformation"
      aria-labelledby="transformation-heading"
      initial={false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      <div className="container transformation-layout">
        <header className="transformation-heading">
          <motion.p variants={editorialVariants} custom={0}>
            THE YELS TRANSFORMATION
          </motion.p>
          <motion.h2
            id="transformation-heading"
            variants={editorialVariants}
            custom={0.08}
          >
            From potential
            <br />
            <em>to real impact.</em>
          </motion.h2>
        </header>

        <div className="transformation-comparison">
          <TransformationPanel
            kind="before"
            reduced={reduced}
          />
          <motion.div
            className="transformation-arrow"
            aria-hidden="true"
            variants={arrowVariants}
          >
            <span className="transformation-arrow-desktop">→</span>
            <span className="transformation-arrow-mobile">↓</span>
          </motion.div>
          <TransformationPanel
            kind="after"
            reduced={reduced}
          />
        </div>
      </div>
    </motion.section>
  );
}
