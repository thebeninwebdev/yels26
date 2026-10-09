export type Speaker = {
  id: string;
  name: string;
  role: string;
  organisation: string;
  bio: string;
  image: string | null;
  isPlaceholder: boolean;
};
export type AgendaSession = {
  id: string;
  sessionNumber: string;
  title: string;
  description: string;
  timeLabel: string;
  track: string;
  speakerId: string;
  takeaways: string[];
  isPlaceholder: boolean;
};
// Disable both preview collections without changing their layout components.
export const homepageConfig = { showDemoContent: true };
export const speakers: Speaker[] = [
  {
    id: "ada",
    name: "Ada Okoro",
    role: "Leadership Development Facilitator",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional facilitator profile exploring purposeful leadership, collaborative decision-making and the confidence to lead through change.",
    image: null,
    isPlaceholder: true,
  },
  {
    id: "tunde",
    name: "Tunde Bello",
    role: "Entrepreneurship Mentor",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional mentor profile focused on testing ideas, understanding customer needs and building sustainable opportunities.",
    image: null,
    isPlaceholder: true,
  },
  {
    id: "efe",
    name: "Efe Aigbe",
    role: "Digital Skills Educator",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional educator profile exploring practical digital skills, adaptable learning and the changing world of work.",
    image: null,
    isPlaceholder: true,
  },
  {
    id: "zainab",
    name: "Zainab Musa",
    role: "Innovation Strategist",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional strategist profile centred on creative problem-solving, experimentation and turning insights into useful solutions.",
    image: null,
    isPlaceholder: true,
  },
  {
    id: "chidi",
    name: "Chidi Nwosu",
    role: "Career Development Coach",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional coach profile exploring career direction, transferable skills and meaningful professional relationships.",
    image: null,
    isPlaceholder: true,
  },
  {
    id: "osaretin",
    name: "Osaretin Omoregie",
    role: "Community Leadership Facilitator",
    organisation: "Demo profile · organisation TBA",
    bio: "A fictional facilitator profile focused on community collaboration, shared responsibility and networks that create lasting value.",
    image: null,
    isPlaceholder: true,
  },
];
export const agenda: AgendaSession[] = [
  {
    id: "leadership",
    sessionNumber: "01",
    title: "Leadership in a Changing World",
    description:
      "Explore how to lead with purpose when the path ahead is uncertain. A practical conversation about values, decisions and collective progress.",
    timeLabel: "Illustrative · 9:00–10:00 AM",
    track: "Leadership",
    speakerId: "ada",
    takeaways: [
      "Define your personal leadership values.",
      "Practise a framework for thoughtful decisions.",
      "Turn a shared challenge into a first action.",
    ],
    isPlaceholder: true,
  },
  {
    id: "opportunities",
    sessionNumber: "02",
    title: "Turning Ideas into Sustainable Opportunities",
    description:
      "Move from a promising idea to a useful proposition. Explore the questions that help you understand a need before building a solution.",
    timeLabel: "Illustrative · 10:30–11:30 AM",
    track: "Innovation",
    speakerId: "tunde",
    takeaways: [
      "Identify a problem worth solving.",
      "Map a simple value proposition.",
      "Design a small, low-cost experiment.",
    ],
    isPlaceholder: true,
  },
  {
    id: "digital",
    sessionNumber: "03",
    title: "Digital Skills and the Future of Work",
    description:
      "Consider how digital tools are changing work and what it means to keep learning. Build a practical approach to developing relevant skills.",
    timeLabel: "Illustrative · 12:00–1:00 PM",
    track: "Future of Work",
    speakerId: "efe",
    takeaways: [
      "Map your current and emerging skills.",
      "Choose tools that support your goals.",
      "Create a focused personal learning plan.",
    ],
    isPlaceholder: true,
  },
  {
    id: "networks",
    sessionNumber: "04",
    title: "Building Networks That Create Impact",
    description:
      "Explore relationships built on shared purpose and mutual contribution. Learn how a conversation can become a meaningful collaboration.",
    timeLabel: "Illustrative · 2:00–3:00 PM",
    track: "Community",
    speakerId: "osaretin",
    takeaways: [
      "Introduce your purpose with clarity.",
      "Recognise opportunities to collaborate.",
      "Plan a thoughtful follow-up.",
    ],
    isPlaceholder: true,
  },
];
