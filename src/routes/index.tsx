import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keeley Zou — Marketing Designer" },
      { name: "description", content: "Portfolio of Keeley Zou, a marketing designer crafting campaigns, brand systems and launch visuals." },
      { property: "og:title", content: "Keeley Zou — Marketing Designer" },
      { property: "og:description", content: "Campaigns, brand systems and launch visuals by Keeley Zou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const work = [
  { title: "Bloom Season Campaign", tag: "Campaign · Social", year: "2026", tone: "bg-primary" },
  { title: "Northwind Rebrand", tag: "Brand Identity", year: "2025", tone: "bg-accent" },
  { title: "Launch Week Toolkit", tag: "Product Marketing", year: "2025", tone: "bg-secondary" },
  { title: "Field Notes Newsletter", tag: "Email · Editorial", year: "2024", tone: "bg-foreground" },
];

const services = ["Campaign concepts", "Brand systems", "Social & paid creative", "Launch & event visuals", "Email & landing pages", "Pitch decks"];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm">
        <span className="font-display text-xl">Keeley Zou</span>
        <div className="flex gap-6">
          <a href="#work" className="hover:text-primary">Work</a>
          <a href="#about" className="hover:text-primary">About</a>
          <a href="#contact" className="hover:text-primary">Contact</a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="mb-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">Marketing Designer</p>
        <h1 className="font-display text-6xl leading-[0.95] md:text-8xl">
          Design that makes <em className="text-primary">people stop</em> scrolling.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          I'm Keeley — I turn marketing goals into campaigns, brand moments and visuals people remember.
        </p>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 font-display text-4xl">Selected work</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {work.map((w, i) => (
            <article key={w.title} className={`group ${i % 2 ? "md:mt-16" : ""}`}>
              <div className={`${w.tone} aspect-[4/3] rounded-2xl transition-transform duration-500 group-hover:-translate-y-2`} />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-2xl">{w.title}</h3>
                <span className="text-sm text-muted-foreground">{w.year}</span>
              </div>
              <p className="text-sm text-muted-foreground">{w.tag}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl">About</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              I've spent years partnering with marketing and growth teams to ship work that's on-brand, on-time and
              built to perform. Strategy first, pixels second — but the pixels matter a lot.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 self-end">
            {services.map((s) => (
              <li key={s} className="border-t border-border pt-3">{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-5xl md:text-7xl">Let's make something.</h2>
        <a href="mailto:keeeleyz@gmail.com" className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-primary-foreground transition hover:opacity-90">
          keeeleyz@gmail.com
        </a>
        <p className="mt-16 text-sm text-muted-foreground">© 2026 Keeley Zou</p>
      </section>
    </main>
  );
}
