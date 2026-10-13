import Image from "next/image";
import { speakers, agenda, homepageConfig } from "../demo-data";
import { Reveal } from "./motion";
import { event } from "../event";
export function Speakers() {
  return (
    <section
      id="speakers"
      tabIndex={-1}
      className="section speakers-section"
      aria-labelledby="speakers-heading"
    >
      <div className="container">
        <Reveal className="section-heading centered">
          <p className="section-label">THE PEOPLE. THE PERSPECTIVES.</p>
          <h2 id="speakers-heading">
            Meet the voices
            <br />
            shaping tomorrow.
          </h2>
          <p className="preview-note">
            {homepageConfig.showDemoContent
              ? "Preview lineup — speakers to be confirmed."
              : "Speakers will be announced soon."}
          </p>
          {homepageConfig.showDemoContent && (
            <p className="demo-disclosure">
              Fictional profiles for a preview of the experience. No speakers
              are confirmed.
            </p>
          )}
        </Reveal>
        {homepageConfig.showDemoContent && (
          <div className="speaker-grid">
            {speakers.map((speaker, i) => (
              <Reveal key={speaker.id} kind="speaker" delay={(i % 3) * 0.08}>
                <article
                  id={`speaker-${speaker.id}`}
                  className={`speaker-card speaker-color-${i % 3}`}
                >
                  <div className="portrait-frame">
                    {speaker.image ? (
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        sizes="(max-width: 599px) 90vw, (max-width: 999px) 44vw, 29vw"
                      />
                    ) : (
                      <div
                        className={`portrait-placeholder portrait-${i % 3}`}
                        aria-hidden="true"
                      >
                        <span className="portrait-orbit" />
                        <span className="portrait-head" />
                        <span className="portrait-body" />
                        <span className="portrait-initials">
                          {speaker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <span className="portrait-label">
                      {speaker.isPlaceholder ? "FICTIONAL PROFILE" : "SPEAKER"}
                    </span>
                    <span className="portrait-index">0{i + 1}</span>
                  </div>
                  <div className="speaker-info">
                    <h3>{speaker.name}</h3>
                    <p>{speaker.role}</p>
                    <details>
                      <summary>
                        About this{" "}
                        {speaker.isPlaceholder ? "demo profile" : "speaker"}{" "}
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>{speaker.bio}</p>
                      <small>{speaker.organisation}</small>
                    </details>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
export function Agenda() {
  return (
    <section
      id="agenda"
      tabIndex={-1}
      className="section agenda-section"
      aria-labelledby="agenda-heading"
    >
      <span id="programme" className="anchor-alias" />
      <div className="container">
        <Reveal className="section-heading agenda-heading">
          <div>
            <p className="section-label">ROOM FOR YOUR NEXT IDEA</p>
            <h2 id="agenda-heading">
              Learn. Connect.
              <br />
              <em>Build what comes next.</em>
            </h2>
          </div>
          <div>
            <p className="preview-note">
              {homepageConfig.showDemoContent
                ? "Sample programme — sessions and times are subject to confirmation."
                : "Full programme coming soon."}
            </p>
            <p className="demo-disclosure">
              Main summit · {event.dateLabel}
              <br />
              {event.location}. Event time to be announced.
            </p>
          </div>
        </Reveal>
        {homepageConfig.showDemoContent && (
          <div className="agenda-list">
            {agenda.map((session) => {
              const speaker = speakers.find((s) => s.id === session.speakerId);
              return (
                <Reveal key={session.id} kind="agenda">
                  <article className="agenda-block">
                    <span className="session-number">
                      {session.sessionNumber}
                      <span>/ SESSION</span>
                    </span>
                    <div
                      className={`session-ticket session-${session.sessionNumber}`}
                      aria-hidden="true"
                    >
                      <span>YELS 2026</span>
                      <strong>
                        {event.dateLabel.split(" ")[0]} {event.dateLabel.split(" ")[1].toUpperCase()}
                      </strong>
                      <span className="ticket-star">✳</span>
                      <small>{event.location.split(", ").slice(1).join(", ").toUpperCase()}</small>
                    </div>
                    <div className="session-content">
                      <div className="session-chips">
                        <span>{session.timeLabel}</span>
                        <span>{session.track}</span>
                      </div>
                      <h3>{session.title}</h3>
                      <p className="session-description">
                        {session.description}
                      </p>
                      <h4>What you could take away</h4>
                      <ul>
                        {session.takeaways.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      {speaker && (
                        <a
                          className="facilitator"
                          href={`#speaker-${speaker.id}`}
                        >
                          <span
                            className="facilitator-avatar"
                            aria-hidden="true"
                          >
                            {speaker.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <span>
                            <small>
                              {session.isPlaceholder
                                ? "FICTIONAL FACILITATOR"
                                : "FACILITATOR"}
                            </small>
                            <strong>{speaker.name}</strong>
                          </span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
