"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ease, useMotionPreference } from "./motion";

const beforeRows = [
  "Ideas without enough direction",
  "Limited access to the right people",
  "Unclear next steps",
];
const afterRows = [
  "New people and stronger networks",
  "Fresh leadership and innovation ideas",
  "A clearer sense of what to explore next",
];

function useCompactViewport() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 999px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

function ShiftRows({ rows }: { rows: string[] }) {
  return (
    <div className="transformation-rows">
      {rows.map((row, index) => (
        <div className="transformation-row" key={row}>
          <span>0{index + 1}</span>
          <p>{row}</p>
        </div>
      ))}
    </div>
  );
}

export function YelsTransformation() {
  const section = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const compact = useCompactViewport();
  const staticView = reduced || compact;
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const beforeX = useTransform(scrollYProgress, [0.2, 0.62], [0, "-10vw"]);
  const beforeY = useTransform(scrollYProgress, [0.2, 0.62], [0, -50]);
  const beforeOpacity = useTransform(scrollYProgress, [0.2, 0.62], [1, 0.12]);
  const beforeScale = useTransform(scrollYProgress, [0.2, 0.62], [1, 0.94]);
  const beforeRotate = useTransform(scrollYProgress, [0.2, 0.62], [0, -2]);
  const afterX = useTransform(scrollYProgress, [0.38, 0.76], [300, 0]);
  const afterY = useTransform(scrollYProgress, [0.38, 0.76], [90, 0]);
  const afterOpacity = useTransform(scrollYProgress, [0.38, 0.76], [0, 1]);
  const afterScale = useTransform(scrollYProgress, [0.38, 0.76], [0.94, 1]);
  const afterRotate = useTransform(scrollYProgress, [0.38, 0.76], [2, 0]);
  const accentOneY = useTransform(scrollYProgress, [0, 1], [40, -60]);
  const accentTwoX = useTransform(scrollYProgress, [0, 1], [-20, 30]);

  return (
    <section className="yels-transformation" ref={section} aria-labelledby="transformation-heading">
      <div className="transformation-sticky">
        <motion.span className="transformation-accent transformation-accent-one" aria-hidden="true" style={staticView ? undefined : { y: accentOneY }} />
        <motion.span className="transformation-accent transformation-accent-two" aria-hidden="true" style={staticView ? undefined : { x: accentTwoX }} />
        <span className="transformation-accent transformation-accent-three" aria-hidden="true" />
        <div className="transformation-frame">
        <header className="transformation-heading">
          <p>THE SHIFT</p>
          <h2 id="transformation-heading">Life before<br />and after<br />YELS.</h2>
        </header>
        <div className="transformation-stage-wrap">
        <motion.article
          className="transformation-stage transformation-before"
          style={staticView ? undefined : { x: beforeX, y: beforeY, opacity: beforeOpacity, scale: beforeScale, rotate: beforeRotate }}
          initial={staticView ? { opacity: 0, y: 40 } : false}
          whileInView={staticView ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="transformation-label">BEFORE YELS</p>
          <h3>You know you want more.<br />You’re still working out<br />what comes next.</h3>
          <ShiftRows rows={beforeRows} />
        </motion.article>
        <motion.article
          className="transformation-stage transformation-after"
          style={staticView ? undefined : { x: afterX, y: afterY, opacity: afterOpacity, scale: afterScale, rotate: afterRotate }}
          initial={staticView ? { opacity: 0, y: 40 } : false}
          whileInView={staticView ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: staticView ? 0.12 : 0, ease }}
        >
          <p className="transformation-label">AFTER YELS</p>
          <h3>More perspective.<br />More connection.<br />A clearer next step.</h3>
          <ShiftRows rows={afterRows} />
          <p className="transformation-disclaimer">YELS creates the environment for exposure, learning and connection. What participants do next is their own journey.</p>
        </motion.article>
        </div>
        </div>
      </div>
    </section>
  );
}
