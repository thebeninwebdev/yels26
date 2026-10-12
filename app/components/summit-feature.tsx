"use client";

import { motion } from "framer-motion";
import { event } from "../event";
import { ease, useMotionPreference } from "./motion";

const cardVariants = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
};

export function SummitFeature() {
  const reduced = useMotionPreference();
  const [day, month, year] = event.dateLabel.split(" ");
  const [city, state] = event.location.split(", ");
  const name = event.name.replace(" 2026", "");

  return (
    <section className="summit-feature-section" aria-labelledby="summit-feature-title">
      <div className="container">
        <motion.article className="summit-feature-card" variants={cardVariants} initial={reduced ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <motion.div className="summit-feature-meta" initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reduced ? 0 : 0.16, duration: 0.5, ease }}>
            <div><span>DATE:</span><strong>{day} {month}<br />{year}</strong></div>
            <div><span>LOCATION:</span><strong>{city}<br />{state}</strong></div>
          </motion.div>
          <div className="summit-feature-bottom">
            <h2 className="summit-feature-title" id="summit-feature-title" aria-label={event.name}>
              {name}<br /><span>{year}</span>
            </h2>
            <motion.a href={event.registrationUrl} className="summit-feature-cta" initial={reduced ? false : { opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: reduced ? 0 : 0.4, duration: 0.5, ease }}>
              <span className="summit-feature-cta-label">Register for YELS</span><span className="summit-feature-cta-arrow" aria-hidden="true">↗</span>
            </motion.a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
