import Image from "next/image";
import { navigation } from "./event";
import { RibbonArtwork } from "./components/artwork";
import { Countdown, FAQ } from "./components/interactive";
import { Icon, RegistrationCTA } from "./components/ui";
import { PageFrame } from "./components/page-frame";
import { HeroSequence, HeroText, Reveal } from "./components/motion";
import { DateMarquee } from "./components/date-marquee";
import { AboutSection } from "./components/about";
import { YelsTransformation } from "./components/transformation";
import { Audience, BootcampExperience, Experience, FinalCTA, PitchOpportunity } from "./components/experience";
import { ConvenerSection } from "./components/convener";

export default function Home() {
  return (
    <PageFrame>
      <div id="top" tabIndex={-1}>
        <main id="main" tabIndex={-1}>
          <HeroSequence introTitle="YELS 26" artwork={<RibbonArtwork />}>
            <HeroText
              eyebrow="BENIN CITY, EDO STATE, NIGERIA"
              organiser={
                <div className="hero-organiser-lockup">
                  <p className="hero-organiser-label">Presented by</p>
                  <a
                    className="hero-organiser-content"
                    href="https://www.instagram.com/yali_networkedo/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Visit YALI Network Edo on Instagram"
                  >
                    <Image
                      className="hero-organiser-logo"
                      src="/us-diplomatic-mission-nigeria.jpg"
                      alt="United States Diplomatic Mission in Nigeria"
                      width={119}
                      height={91}
                    />
                    <Image
                      className="hero-organiser-logo hero-organiser-logo-yali"
                      src="/yali-network-edo.jpg"
                      alt="YALI Network Edo"
                      width={135}
                      height={118}
                    />
                  </a>
                </div>
              }
              heading={["Youth Empowerment", "& Leadership", "Summit 2026"]}
              cta={<RegistrationCTA />}
            />
          </HeroSequence>
          <DateMarquee />
          <Countdown />
          <AboutSection />
          <Audience />
          <ConvenerSection />
          <Experience />
          <YelsTransformation />
          <BootcampExperience />
          <PitchOpportunity />
          <section id="registration" className="section closing-section" aria-labelledby="journey-heading">
            <div className="container">
              <Reveal className="section-heading centered">
                <p className="section-label">YOUR YELS JOURNEY</p>
                <h2 id="journey-heading">Your future starts<br /><em>with a step.</em></h2>
              </Reveal>
              <div className="how-it-works">
                <ol>
                  <li><Icon name="document" /><div><h3>Register</h3><p>Fill in a short form to secure your spot.</p></div></li>
                  <li><Icon name="qr" /><div><h3>Receive your QR ticket</h3><p>Get your unique ticket via email.</p></div></li>
                  <li><Icon name="check" /><div><h3>Check in</h3><p>Present your QR code at the venue.</p></div></li>
                </ol>
              </div>
            </div>
          </section>
          <section id="faq" tabIndex={-1} className="section faq-section" aria-labelledby="faq-heading">
            <div className="container faq-layout">
              <Reveal>
                <p className="section-label">A LITTLE MORE CLARITY</p>
                <h2 id="faq-heading">Good questions.<br /><em>Clear answers.</em></h2>
                <p className="section-copy">The essentials for your YELS 2026 experience. More details are on the way.</p>
              </Reveal>
              <FAQ />
            </div>
          </section>
          <FinalCTA />
        </main>
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <a href="https://www.instagram.com/yali_networkedo/" target="_blank" rel="noreferrer" className="footer-partner-logos" aria-label="Visit YALI Network Edo on Instagram">
                <Image src="/us-diplomatic-mission-nigeria.jpg" alt="United States Diplomatic Mission in Nigeria" width={119} height={91} />
                <Image src="/yali-network-edo.jpg" alt="YALI Network Edo" width={135} height={118} />
              </a>
              <nav aria-label="Footer navigation">
                {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
              </nav>
            </div>
            <div className="footer-bottom">
              <p>YOUTH EMPOWERMENT &amp; LEADERSHIP SUMMIT</p>
              <p>BENIN CITY, EDO STATE · 2026</p>
              <a className="footer-credit" href="https://mreseosa.com" target="_blank" rel="noreferrer">Built by Mreseosa</a>
            </div>
          </div>
        </footer>
      </div>
    </PageFrame>
  );
}
