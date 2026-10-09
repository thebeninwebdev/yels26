"use client";
import { useMotionPreference } from "./motion";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
function DateTag({ bootcamp, index }: { bootcamp: boolean; index: number }) {
  return (
    <div className={`date-ticket ticket-color-${index % 3}`}>
      <span className="ticket-label">
        {bootcamp ? "PHYSICAL BOOTCAMP" : "SUMMIT"}
      </span>
      <div className="ticket-details">
        <strong>{bootcamp ? "08–09" : "2026"}</strong>
        <span>
          {bootcamp ? (
            <>
              DECEMBER
              <br />
              2026
            </>
          ) : (
            <>
              DECEMBER
              <br />
              <b>DATE TBA</b>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
export function DateMarquee() {
  const [paused, setPaused] = useState(false);
  const reduced = useMotionPreference();
  const group = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const x = useMotionValue(0);
  useEffect(() => {
    const el = group.current;
    if (!el) return;
    const resize = () => {
      width.current = el.offsetWidth;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    return () => observer.disconnect();
  }, []);
  useAnimationFrame((_, delta) => {
    if (paused || reduced || !width.current) return;
    const next = x.get() - Math.min(delta, 64) * 0.042;
    x.set(
      (((next % width.current) + width.current) % width.current) -
        width.current,
    );
  });
  return (
    <section
      className={`marquee-section ${reduced ? "marquee-static" : ""}`}
      aria-label="YELS 2026 event dates"
    >
      <div className="marquee-tilt">
        <motion.div className="marquee-track" style={{ x: reduced ? 0 : x }}>
          {[0, 1].map((g) => (
            <div
              ref={g === 0 ? group : undefined}
              className="marquee-group"
              key={g}
              aria-hidden={g === 1 ? true : undefined}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} aria-hidden={i > 1 ? true : undefined}>
                  <DateTag bootcamp={i % 2 === 1} index={i} />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="container marquee-control">
        <p>Two experiences. One shared future.</p>
        <button
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          disabled={!!reduced}
        >
          {reduced
            ? "Motion reduced"
            : paused
              ? "Resume date marquee"
              : "Pause date marquee"}{" "}
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        </button>
      </div>
    </section>
  );
}
