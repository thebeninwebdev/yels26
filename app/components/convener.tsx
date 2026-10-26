"use client";

import Image from "next/image";
import Link from "next/link";
import { convenerRoles } from "../convener-data";
import { Reveal } from "./motion";

export function ConvenerPortrait({ priority = false }: { priority?: boolean }) {
  return (
    <div className="convener-portrait-frame">
      <span className="convener-frame-line convener-frame-line-one" aria-hidden="true" />
      <span className="convener-frame-line convener-frame-line-two" aria-hidden="true" />
      <Image
        src="/convener.jpeg"
        alt="Chinye Patrick-Biose, convener of YELS 2026"
        width={1066}
        height={1280}
        sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1199px) 42vw, 45vw"
        priority={priority}
      />
    </div>
  );
}

export function ConvenerSection() {
  return (
    <section id="convener" className="section convener-section" aria-labelledby="convener-heading">
      <div className="container convener-layout">
        <Reveal className="convener-portrait-reveal" kind="image">
          <ConvenerPortrait />
        </Reveal>
        <div className="convener-copy">
          <Reveal delay={0.05}><p className="section-label">MEET THE CONVENER</p></Reveal>
          <Reveal delay={0.12}><h2 id="convener-heading">Chinye<br /><em>Patrick-Biose</em></h2></Reveal>
          <Reveal delay={0.19}><div className="convener-roles">{convenerRoles.map((role) => <p key={role}>{role}</p>)}</div></Reveal>
          <Reveal delay={0.26}><div className="convener-intro"><p>Precious Chinye Patrick-Biose is a youth development advocate, leadership development practitioner and community organiser. As Coordinator of YALI Network Edo State, she leads initiatives that strengthen youth leadership, entrepreneurship and civic engagement.</p><p>Her work connects young people with practical skills, supportive networks and opportunities to contribute meaningfully to their communities.</p></div></Reveal>
          <Reveal delay={0.33}><Link className="convener-link" href="/convener">Read full biography <span aria-hidden="true">↗</span></Link></Reveal>
        </div>
      </div>
    </section>
  );
}
