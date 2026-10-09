export const event = {
  name: "Youth Empowerment and Leadership Summit 2026",
  organiser: "YALI Network Edo",
  theme: "Shaping the Future of Work",
  supportingTheme:
    "Empowering Youth Innovation and Leadership for Economic Growth",
  location: "Benin City, Edo State",
  dateLabel: "December 2026",
  // Set both confirmed ISO timestamps with Z or an explicit timezone offset.
  startsAt: null as string | null,
  endsAt: null as string | null,
  registrationUrl: null as string | null,
  bootcamp: { dates: "8–9 December 2026", time: "9:00 AM–3:00 PM" },
};
export const navigation = [
  { label: "About", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Agenda", href: "#agenda" },
  { label: "Bootcamp", href: "#bootcamp" },
  { label: "FAQ", href: "#faq" },
];
export const content = {
  about:
    "YELS 2026 is a platform for young people to learn, connect and lead—driving innovation, opportunity and inclusive growth across our communities and beyond.",
  benefits: [
    {
      title: "Learn",
      text: "Gain practical skills, fresh perspectives and real-world insights.",
      icon: "book",
    },
    {
      title: "Connect",
      text: "Build meaningful relationships with peers, mentors and opportunity builders.",
      icon: "people",
    },
    {
      title: "Lead",
      text: "Turn ideas into impact and be part of a more inclusive and prosperous future.",
      icon: "chart",
    },
  ],
  programme:
    "A programme designed to equip young people with skills, networks and opportunities to shape the future.",
  themes: [
    {
      title: "Leadership",
      text: "Building people, purpose and stronger communities.",
    },
    { title: "Innovation", text: "Turning bold ideas into real solutions." },
    {
      title: "Future of Work",
      text: "Preparing for tomorrow’s opportunities today.",
    },
  ],
  closing:
    "Be part of a movement of young people driving innovation, opportunity and lasting impact.",
  faqs: [
    {
      question: "What is YELS 2026?",
      answer:
        "The Youth Empowerment and Leadership Summit 2026 is organised by YALI Network Edo. Under the theme ‘Shaping the Future of Work’, it brings young people together to learn, connect and lead.",
    },
    {
      question: "When and where will it take place?",
      answer: `The main summit is planned for ${event.dateLabel} in ${event.location}. The exact date, time and venue are awaiting announcement.`,
    },
    {
      question: "Will there be a physical bootcamp?",
      answer: `Yes. A physical bootcamp is one activity within YELS 2026, scheduled for ${event.bootcamp.dates}, ${event.bootcamp.time}. Participation details are coming soon. These are the bootcamp dates, not the main summit dates.`,
    },
    {
      question: "When will the full programme be released?",
      answer:
        "The full programme is coming soon. Leadership, Innovation and Future of Work are programme themes; sessions and facilitators have not yet been announced.",
    },
    {
      question: "How will registration work?",
      answer:
        "Registration details are awaiting announcement. The planned attendee experience is to register, receive a QR ticket by email and present it at check-in. Registration is not open on this website yet.",
    },
  ],
};
