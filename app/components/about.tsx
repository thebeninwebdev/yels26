import { content } from "../event";
import { Reveal } from "./motion";
import { Icon } from "./ui";

export function AboutSection() {
  return (
    <section
      id="about"
      tabIndex={-1}
      className="section about-section"
      aria-labelledby="about-heading"
    >
      <div className="container about-layout">
        <div className="about-copy">
          <Reveal className="about-label-reveal">
            <p className="section-label">WHY YELS</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="about-heading">
              A generation
              <br />
              <em>ready to lead.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="intro-copy">{content.about}</p>
          </Reveal>
        </div>

        <div className="benefit-grid">
          {content.benefits.map((benefit, index) => (
            <Reveal
              className="benefit-reveal"
              key={benefit.title}
              delay={0.18 + index * 0.08}
            >
              <article className={`benefit-panel benefit-${index}`}>
                <div className="benefit-icon">
                  <Icon name={benefit.icon} />
                </div>
                <h3>
                  {benefit.title}<span>.</span>
                </h3>
                <p>{benefit.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
