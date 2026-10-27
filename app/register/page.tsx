import Image from "next/image";
import Link from "next/link";
import { event } from "../event";
import { RegistrationForm } from "./registration-form";
import "./registration.css";

export const metadata = {
  title: "Register | YELS 2026",
  description: "Register for the Youth Empowerment and Leadership Summit 2026.",
};

export default function RegisterPage() {
  return (
    <main id="main" className="registration-page" tabIndex={-1}>
      <section className="registration-hero" aria-label="YELS 2026 registration">
        <Image
          src="/images/yels-hero.png"
          alt="YELS participant at a summit event"
          width={1536}
          height={1024}
          priority
          sizes="100vw"
        />
        <div className="registration-hero-overlay" />
        <div className="registration-hero-content">
          <div className="registration-hero-bar"><p>YALI NETWORK <strong>EDO</strong></p><Link href="/" className="registration-home"><span aria-hidden="true">←</span> Back to summit</Link></div>
        </div>
      </section>
      <div className="registration-hero-copy-wrap">
        <div className="registration-hero-copy">
          <p className="eyebrow">REGISTRATION</p>
          <h1 id="registration-page-title">Be part of <em>YELS 2026.</em></h1>
          <p>Join young leaders shaping the future of work.</p>
          <dl className="registration-hero-details">
            <div><dt>Date</dt><dd>{event.dateLabel}</dd></div>
            <div><dt>Location</dt><dd>{event.location}</dd></div>
          </dl>
        </div>
      </div>
      <div className="registration-shell">
        <div className="registration-content">
          <aside className="registration-details" aria-label="YELS 2026 event information">
            <p className="eyebrow">YELS 2026</p>
            <h2>Plan your <em>experience.</em></h2>
            <dl>
              <div><dt>Date</dt><dd>{event.dateLabel}</dd></div>
              <div><dt>Location</dt><dd>{event.location}</dd></div>
              <div><dt>Venue</dt><dd>{event.venue}</dd></div>
            </dl>
            <div className="registration-next">
              <h3>What happens next</h3>
              <ol>
                <li>Complete your registration.</li>
                <li>Receive your confirmation and ticket.</li>
                <li>Bootcamp applications are reviewed separately.</li>
              </ol>
            </div>
          </aside>
          <RegistrationForm />
        </div>
      </div>
    </main>
  );
}
