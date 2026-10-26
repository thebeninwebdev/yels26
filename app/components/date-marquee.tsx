"use client";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "./motion";

function DateTag({ bootcamp, index }: { bootcamp: boolean; index: number }) {
  return <div className={`date-ticket ticket-color-${index % 3}`}><span className="ticket-label">{bootcamp ? "PHYSICAL BOOTCAMP" : "FULL PROGRAMME"}</span><div className="ticket-details"><strong>{bootcamp ? "08–09" : "08–10"}</strong><span>DECEMBER<br /><b>2026</b></span></div></div>;
}

export function DateMarquee() {
  const reduced = useMotionPreference();
  const group = useRef<HTMLDivElement>(null), width = useRef(0), x = useMotionValue(0);
  useEffect(() => { const el = group.current; if (!el) return; const resize = () => { width.current = el.offsetWidth; }; const observer = new ResizeObserver(resize); observer.observe(el); resize(); return () => observer.disconnect(); }, []);
  useAnimationFrame((_, delta) => { if (reduced || !width.current) return; const next = x.get() - Math.min(delta, 64) * 0.042; x.set((((next % width.current) + width.current) % width.current) - width.current); });
  return <section className={`marquee-section ${reduced ? "marquee-static" : ""}`} aria-label="YELS 2026 event dates"><div className="marquee-tilt"><motion.div className="marquee-track" style={{ x: reduced ? 0 : x }}>{[0, 1].map((g) => <div ref={g === 0 ? group : undefined} className="marquee-group" key={g} aria-hidden={g === 1 ? true : undefined}>{Array.from({ length: 8 }, (_, i) => <div key={i} aria-hidden={i > 1 ? true : undefined}><DateTag bootcamp={i % 2 === 1} index={i} /></div>)}</div>)}</motion.div></div></section>;
}
