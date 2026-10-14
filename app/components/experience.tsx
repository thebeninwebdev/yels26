import { content, event } from "../event";
import Image from "next/image";
import { RegistrationCTA } from "./ui";
import { Reveal } from "./motion";

export function Experience() { return <section id="experience" className="section experience-section" aria-labelledby="experience-heading"><div className="container"><Reveal className="experience-heading"><p className="section-label">THE YELS EXPERIENCE</p><h2 id="experience-heading">More than<br /><em>a summit.</em></h2><p>YELS 2026 brings learning, enterprise, innovation, mentorship and meaningful connections into one experience.</p></Reveal><div className="experience-list">{content.experience.map((item, index) => <Reveal key={item.title} delay={index * .06}><article><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div></div></section>; }
export function BootcampExperience() { return <section id="bootcamp" className="section bootcamp-experience" aria-labelledby="bootcamp-heading"><div className="container"><Reveal><p className="section-label">YELS 2026 PHYSICAL BOOTCAMP</p><div className="bootcamp-head"><h2 id="bootcamp-heading">Built for<br /><em>deeper work.</em></h2><p>An intensive physical learning experience for selected participants. Registering for YELS does not automatically mean selection for the Bootcamp.</p></div></Reveal><div className="bootcamp-numbers"><p><b>50</b><span>Selected participants</span></p><p><b>2</b><span>Days</span></p><p><b>1</b><span>Intensive experience</span></p></div><p className="bootcamp-date">{event.bootcamp.dates} · {event.bootcamp.time}</p><ol className="bootcamp-journey">{content.bootcampJourney.map((step, index) => <li key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></div></section>; }
export function PitchOpportunity() {
  const { pitch } = event;

  return (
    <section className="pitch-section" aria-labelledby="pitch-heading">
      <div className="pitch-glow" aria-hidden="true" />
      <div className="container pitch-layout">
        <div className="pitch-copy">
          <Reveal className="pitch-label-reveal">
            <p className="section-label">{pitch.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="pitch-heading">{pitch.heading}<br /><em>{pitch.accentHeading}</em></h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="pitch-description">{pitch.description}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="pitch-status" role="status">{pitch.status}</p>
          </Reveal>
        </div>
        <Reveal className="pitch-media" delay={0.16} kind="image">
          <Image
            src="/images/yels-hero.png"
            alt="Young attendee in a conference environment"
            fill
            sizes="(max-width: 768px) calc(100vw - 48px), 45vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
export function Audience() {
  return (
    <section className="audience-section" aria-labelledby="audience-heading">
      <div className="audience-glow" aria-hidden="true" />
      <div className="container audience-layout">
        <Reveal className="audience-label-reveal">
          <h2 id="audience-heading" className="section-label audience-label">Who is YELS for?</h2>
        </Reveal>
        <ul className="audience-words">
          {content.audiences.map((audience, index) => {
            const words = audience.split(" ");
            const isMultiWord = words.length > 1;
            const isLong = audience === "Private-sector practitioners";

            return (
              <li key={audience} className="audience-item">
                <Reveal delay={0.08 + index * 0.08} className="audience-reveal">
                  <span className={`audience-word${isMultiWord ? " audience-word--multi" : ""}${isLong ? " audience-word--long" : ""}`}>
                    {words.map((word, wordIndex) => (
                      <span className="audience-word-part" key={word}>
                        {word}{wordIndex < words.length - 1 ? " " : ""}
                      </span>
                    ))}<span className="audience-period">.</span>
                  </span>
                </Reveal>
              </li>
            );
          })}
        </ul>
        <Reveal delay={0.66}>
          <p className="audience-close">If you&apos;re thinking seriously about where the future is going, you belong in the conversation.</p>
        </Reveal>
      </div>
    </section>
  );
}
export function FinalCTA() { return <section className="final-cta" aria-labelledby="final-cta-heading"><div className="container"><Reveal className="final-cta-inner"><p>YELS 2026 · BENIN CITY, EDO STATE</p><h2 id="final-cta-heading">The future<br />won&apos;t <em>wait.</em></h2><span>Neither should you.</span><RegistrationCTA /></Reveal></div></section>; }
