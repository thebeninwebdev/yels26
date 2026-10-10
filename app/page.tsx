import { content, event, navigation } from "./event";
import { HorizonArtwork, RibbonArtwork } from "./components/artwork";
import { Countdown, FAQ } from "./components/interactive";
import { Icon, RegistrationCTA, Wordmark } from "./components/ui";
import { PageFrame } from "./components/page-frame";
import { HeroSequence, HeroText, Reveal } from "./components/motion";
import { DateMarquee } from "./components/date-marquee";
import { Speakers, Agenda } from "./components/programme";
export default function Home() {
  return (
    <PageFrame>
      <div id="top" tabIndex={-1}>
        <main id="main" tabIndex={-1}>
          <HeroSequence artwork={<RibbonArtwork />}>
            <HeroText
              eyebrow="BENIN CITY, EDO STATE"
              heading={["Youth Empowerment", "& Leadership", "Summit 2026"]}
              subtitle={event.theme}
              description={event.supportingTheme}
              cta={<RegistrationCTA />}
            />
          </HeroSequence>
          <DateMarquee />
          <div className="event-context container">
            <p>
              <Icon name="calendar" />
              {event.dateLabel} · {event.location}
            </p>
            <span>Main summit date confirmed; time and venue to be announced.</span>
          </div>
          <Countdown />
          <section
            id="about"
            tabIndex={-1}
            className="section about-section"
            aria-labelledby="about-heading"
          >
            <div className="container">
              <Reveal className="section-heading centered">
                <p className="section-label">ABOUT YELS 2026</p>
                <h2 id="about-heading">
                  A generation
                  <br />
                  <em>ready to lead.</em>
                </h2>
                <p className="intro-copy">{content.about}</p>
              </Reveal>
              <div className="benefit-grid">
                {content.benefits.map((benefit, i) => (
                  <Reveal key={benefit.title} delay={i * 0.08}>
                    <article className={`benefit-panel benefit-${i}`}>
                      <div className="benefit-top">
                        <span>0{i + 1}</span>
                        <Icon name={benefit.icon} />
                      </div>
                      <h3>
                        {benefit.title}
                        <span aria-hidden="true">.</span>
                      </h3>
                      <p>{benefit.text}</p>
                      <div className="benefit-graphic" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
              <Reveal className="intro-art" kind="image">
                <HorizonArtwork />
                <p>
                  Different perspectives.
                  <br />
                  <em>Shared possibilities.</em>
                </p>
                <span className="art-caption">
                  YALI NETWORK EDO / YELS 2026
                </span>
              </Reveal>
            </div>
          </section>
          <Speakers />
          <Agenda />
          <section
            id="bootcamp"
            tabIndex={-1}
            className="bootcamp-section section"
            aria-labelledby="bootcamp-heading"
          >
            <HorizonArtwork variant="bootcamp" />
            <div className="container">
              <Reveal className="bootcamp-content">
                <p className="section-label">PART OF YELS 2026</p>
                <h2 id="bootcamp-heading">
                  Learn
                  <br />
                  by doing.
                </h2>
                <h3>Physical Bootcamp</h3>
                <div className="bootcamp-details">
                  <p>
                    <Icon name="calendar" />
                    {event.bootcamp.dates}
                  </p>
                  <p>
                    <Icon name="clock" />
                    {event.bootcamp.time}
                  </p>
                </div>
                <p className="small-copy">Participation details coming soon.</p>
                <p className="bootcamp-manifesto">
                  PRACTICAL SKILLS / REAL CONNECTIONS / BIGGER OPPORTUNITIES
                </p>
              </Reveal>
            </div>
          </section>
          <section
            id="registration"
            tabIndex={-1}
            className="section closing-section"
            aria-labelledby="closing-heading"
          >
            <div className="container">
              <Reveal className="section-heading centered">
                <p className="section-label">TAKE THE NEXT STEP</p>
                <h2 id="closing-heading">
                  Your future starts
                  <br />
                  <em>with a step.</em>
                </h2>
                <p className="intro-copy">{content.closing}</p>
                <div className="closing-cta">
                  <RegistrationCTA />
                </div>
              </Reveal>
              <div className="how-it-works">
                <p className="journey-note">
                  THE PLANNED ATTENDEE EXPERIENCE · ONCE REGISTRATION OPENS
                </p>
                <ol>
                  <li>
                    <Icon name="document" />
                    <div>
                      <h3>Register</h3>
                      <p>Fill in a short form to secure your spot.</p>
                    </div>
                  </li>
                  <li>
                    <Icon name="qr" />
                    <div>
                      <h3>Receive your QR ticket</h3>
                      <p>Get your unique ticket via email.</p>
                    </div>
                  </li>
                  <li>
                    <Icon name="check" />
                    <div>
                      <h3>Check in</h3>
                      <p>Present your QR code at the venue.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </section>
          <section
            id="faq"
            tabIndex={-1}
            className="section faq-section"
            aria-labelledby="faq-heading"
          >
            <div className="container faq-layout">
              <Reveal>
                <p className="section-label">A LITTLE MORE CLARITY</p>
                <h2 id="faq-heading">
                  Good questions.
                  <br />
                  <em>Clear answers.</em>
                </h2>
                <p className="section-copy">
                  The essentials for your YELS 2026 experience. More details are
                  on the way.
                </p>
              </Reveal>
              <FAQ />
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <a href="#top" aria-label="YALI Network Edo — back to top">
                <Wordmark />
              </a>
              <nav aria-label="Footer navigation">
                {navigation.map((item) => (
                  <a href={item.href} key={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="footer-bottom">
              <p>YOUTH EMPOWERMENT & LEADERSHIP SUMMIT</p>
              <p>BENIN CITY, EDO STATE · 2026</p>
            </div>
          </div>
        </footer>
      </div>
    </PageFrame>
  );
}
