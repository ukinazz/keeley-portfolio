export type Experience = {
  company: string;
  url: string;
  domain: string;
  field: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
};

export const experience: Experience[] = [
  {
    company: "Butterbase",
    url: "https://butterbase.ai",
    domain: "butterbase.ai",
    field: "AI tech startup",
    role: "Founding Marketer",
    period: "2025 to 2026",
    summary: "First marketing hire, owning brand, website and growth from zero.",
    highlights: [
      "Grew the website into a full content hub driving 30% of signups",
      "Owned the visual identity across X, LinkedIn and Discord",
      "Built automated B2B outreach and a creator sponsorship program",
    ],
  },
  {
    company: "Informa Markets",
    url: "https://www.informamarkets.com/",
    domain: "informamarkets.com",
    field: "B2B events & exhibitions",
    role: "Marketing Intern",
    period: "2024 to 2025",
    summary: "Marketing for CBME, one of the world's largest B2B trade shows.",
    highlights: [
      "Designed social, email, web and event creative within brand guidelines",
      "Filmed and edited exhibitor interview videos for future campaigns",
      "Created bilingual content for buyers across multiple channels",
    ],
  },
  {
    company: "Grabie Art",
    url: "https://grabieart.com/",
    domain: "grabieart.com",
    field: "DTC e-commerce",
    role: "Global Marketing Intern",
    period: "2024",
    summary: "Growth creative for an online art brand selling to US customers.",
    highlights: [
      "Produced short-form video and graphics for TikTok and Instagram",
      "Designed briefs and assets for US creator and affiliate campaigns",
      "Redesigned product pages to lift engagement and conversion",
    ],
  },
];
