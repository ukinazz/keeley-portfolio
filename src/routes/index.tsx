import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keeley Zou — Marketer & Designer" },
      { name: "description", content: "Keeley Zou — marketer and designer with 2+ years of experience in campaigns, brand systems and creative design." },
      { property: "og:title", content: "Keeley Zou — Marketer & Designer" },
      { property: "og:description", content: "Marketing strategy meets creative design. Explore Keeley Zou's portfolio and 2+ years of marketing and design experience." },
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
      <header className="bg-primary text-primary-foreground">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 text-sm">
          <a href="#" aria-label="Keeley Zou home" className="font-display text-2xl font-bold">kz<span className="text-muted-foreground">.</span></a>
          <div className="flex items-center gap-5 sm:gap-8">
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#about">about</a></Button>
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#work">portfolio</a></Button>
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#contact">contact</a></Button>
          </div>
        </nav>
      </header>

      <section className="portfolio-intro mx-auto max-w-6xl px-6">
        <div className="pt-8 text-center">
          <h1 className="text-sm font-medium">Keeley Zou</h1>
          <p className="mt-2 text-xs text-muted-foreground">2+ years of marketing & design experience</p>
        </div>
        <div className="split-roles">
          <div className="role-copy">
            <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">marketer</h2>
            <p className="mt-4 max-w-64 text-sm leading-7 text-muted-foreground sm:text-base">Strategy-led campaigns that connect brands with the right people.</p>
          </div>
          <div className="portrait-space" aria-label="Space reserved for Keeley's future portrait" />
          <div className="role-copy">
            <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">designer</h2>
            <p className="mt-4 max-w-64 text-sm leading-7 text-muted-foreground sm:text-base">Thoughtful visuals that bring ideas to life and make brands memorable.</p>
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="mb-10 flex items-center gap-6"><div className="h-px flex-1 bg-border" /><h2 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Selected work</h2><div className="h-px flex-1 bg-border" /></div>
        <div className="grid gap-8 md:grid-cols-2">
          {work.map((w, i) => (
            <article key={w.title} className="group">
              <div className={`${w.tone} flex aspect-[4/3] items-end rounded-md p-6 transition-transform duration-500 motion-safe:group-hover:-translate-y-1`}><span className="text-5xl font-bold text-primary-foreground/50">0{i + 1}</span></div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-2xl">{w.title}</h3>
                <span className="text-sm text-muted-foreground">{w.year}</span>
              </div>
              <p className="text-sm text-muted-foreground">{w.tag}</p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <section id="about" className="border-y border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-bold">Hi, I'm Keeley.</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              With 2+ years of marketing and design experience, I bring strategy and creativity together to build
              campaigns, brand moments and visuals people remember. Strategy first, pixels second — but the pixels matter a lot.
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
        <h2 className="font-display text-4xl font-bold md:text-6xl">Let's make something.</h2>
        <Button asChild size="lg" className="mt-8"><a href="mailto:keeeleyz@gmail.com">keeeleyz@gmail.com <ArrowUpRight /></a></Button>
        <p className="mt-16 text-sm text-muted-foreground">© 2026 Keeley Zou</p>
      </section>
    </main>
  );
}
