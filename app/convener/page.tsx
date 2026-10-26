import type { Metadata } from "next";
import { PageFrame, SiteFooter } from "../components/page-frame";
import { ConvenerPortrait } from "../components/convener";
import { Reveal } from "../components/motion";
import { RegistrationCTA } from "../components/ui";

export const metadata: Metadata = {
  title: "Meet the Convener | YELS 2026",
  description: "Meet Precious Chinye Patrick-Biose, a youth development advocate, leadership development practitioner and community organiser who convenes YELS 2026.",
};

const impacts = [
  ["Emerging Leaders Academy", "Chinye convenes the Emerging Leaders Academy in collaboration with the Edo State Sustainable Development Goals (SDGs) Office. The six-month leadership development programme equips emerging leaders with practical skills in strategic planning, personal branding, public speaking, advocacy, and sustainable development."],
  ["Youth Leadership, Community Health and Innovation", "Through her leadership with YALI Network Edo, Chinye has supported initiatives spanning community health, youth development, environmental sustainability, and innovation. These include free medical outreaches and eye camps, school and community outreaches, environmental cleanup projects, and the NASA Space Apps Challenge in Benin City, which promotes youth innovation, technology, and problem-solving."],
  ["Youth Civic Participation and Electoral Reform", "As the Edo State Coordinator for the Youth Electoral Reform Project (YERP-Naija), Chinye mobilises and engages young people to strengthen their participation in democratic processes and electoral reform advocacy."],
  ["Community Development and Mental Health Advocacy", "Through Rebirth Impact Centre for Community Development, Chinye advances initiatives focused on youth development, mental health advocacy, and community wellbeing."],
];

export default function ConvenerPage() {
  return <PageFrame><div id="top" tabIndex={-1}><main id="main" tabIndex={-1} className="convener-page">
    <section className="convener-profile" aria-labelledby="convener-page-title"><div className="container convener-profile-grid">
      <aside className="convener-identity"><header className="convener-mobile-intro"><p className="section-label">MEET THE CONVENER</p><h2>The person behind the <em>purpose.</em></h2></header><ConvenerPortrait priority /><div className="convener-identity-copy"><span aria-hidden="true" /><h1 id="convener-page-title">Chinye Patrick-Biose</h1><p>Convener, YELS 2026</p><p>Coordinator, YALI Network Edo State</p></div></aside>
      <div className="convener-story"><Reveal><header className="convener-story-intro"><p className="section-label">MEET THE CONVENER</p><h2>The person behind the <em>purpose.</em></h2></header></Reveal><nav className="convener-page-nav" aria-label="Biography sections"><a href="#about">About</a><a href="#impact">Impact</a><a href="#vision">Vision</a></nav>
        <Reveal><section id="about" className="convener-story-section" aria-labelledby="about-convener"><p className="convener-index">01 / ABOUT</p><h2 id="about-convener">Leadership rooted in <em>community.</em></h2><div className="convener-prose"><p>Precious Chinye Patrick-Biose is a youth development advocate, leadership development practitioner, and community organiser with experience in youth engagement, civic participation, advocacy, stakeholder collaboration, and community development.</p><p>She serves as the Coordinator of YALI Network Edo State, providing leadership for initiatives that promote youth leadership, entrepreneurship, and civic engagement. Through this role, she works with young people, government institutions, civil society organisations, and other stakeholders to create opportunities for capacity development and meaningful youth participation.</p><p>She works with Connected Advocacy for Empowerment and Youth Development Initiative as a Youth Engagement Officer, promoting youth civic participation, advocacy, and stakeholder engagement. She also serves as the Edo State Coordinator for the Youth Electoral Reform Project (YERP-Naija), supporting youth participation in electoral reform and democratic processes.</p><p>She is the founder of Rebirth Impact Centre for Community Development, an initiative focused on youth development, mental health advocacy, and building healthier communities.</p><p>Through her work, Chinye is committed to building platforms that connect young people with opportunities, strengthen their leadership capacity, and encourage meaningful contributions to society. The YALI Network Edo Youth Empowerment and Leadership Summit 2026 reflects this commitment.</p></div></section></Reveal>
        <Reveal><section id="impact" className="convener-story-section" aria-labelledby="impact-heading"><p className="convener-index">02 / SELECTED IMPACT</p><h2 id="impact-heading">Turning commitment into <em>action.</em></h2><ol className="impact-list">{impacts.map(([title, text], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section></Reveal>
        <Reveal><section id="vision" className="convener-story-section convener-story-vision" aria-labelledby="vision-heading"><p className="convener-index">03 / LEADERSHIP VISION</p><h2 id="vision-heading">Skills. Networks. <em>Opportunity.</em></h2><div className="convener-prose"><p>Chinye believes young people need access to relevant skills, practical knowledge, supportive networks, and opportunities to transform their ideas into sustainable solutions.</p><p>Through leadership development, strategic partnerships, and youth engagement, she is committed to helping young Nigerians build sustainable enterprises, embrace innovation, and contribute meaningfully to their communities.</p></div><RegistrationCTA label="Register for the Summit" /></section></Reveal>
      </div>
    </div></section>
  </main><SiteFooter /></div></PageFrame>;
}
