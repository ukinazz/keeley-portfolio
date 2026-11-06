import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portfolioWork } from "@/lib/portfolio-work";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keeley Zou | Marketing Designer" },
      { name: "description", content: "Keeley Zou is a marketing designer with 2+ years of experience, bringing audience insight, clear messaging and thoughtful visuals to brands and campaigns." },
      { property: "og:title", content: "Keeley Zou | Marketing Designer" },
      { property: "og:description", content: "Explore Keeley Zou's marketing and design work, where audience insight and creative thinking come together to communicate with purpose." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = ["Campaign concepts", "Brand systems", "Social & paid creative", "Launch & event visuals", "Email & landing pages", "Pitch decks"];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground">
        <nav aria-label="Main navigation" className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5 text-sm">
          <a href="#" aria-label="Keeley Zou home" className="justify-self-start font-display text-2xl font-bold">kz<span className="text-muted-foreground">.</span></a>
          <div className="flex items-center gap-4 sm:gap-8">
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#about">about</a></Button>
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#work">portfolio</a></Button>
            <Button asChild variant="link" className="h-auto p-0 font-normal text-primary-foreground/75"><a href="#contact">contact</a></Button>
          </div>
        </nav>
      </header>

      <section className="portfolio-intro mx-auto max-w-6xl px-6">
        <div className="pt-8 text-center">
          <h1 className="font-display text-2xl font-medium sm:text-4xl">Hi, I'm Keeley Zou</h1>
        </div>
        <div className="split-roles">
          <div className="role-copy">
            <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">marketer</h2>
             <p className="mt-4 max-w-64 text-sm leading-7 text-muted-foreground sm:text-base">Finding the angle that makes a brand worth noticing. Campaigns and content built around what matters to your audience.</p>
          </div>
          <div className="portrait-space" aria-label="Space reserved for Keeley's future portrait" />
          <div className="role-copy">
            <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">designer</h2>
             <p className="mt-4 max-w-64 text-sm leading-7 text-muted-foreground sm:text-base">Giving good ideas a look that feels right. From brand visuals to landing pages, every detail works toward a clear next step.</p>
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="mb-10 flex items-center gap-6"><div className="h-px flex-1 bg-border" /><h2 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Selected work</h2><div className="h-px flex-1 bg-border" /></div>
        <div className="grid gap-8 md:grid-cols-2">
          {portfolioWork.map((w) => (
            <article key={w.title} className="group">
              <Button asChild variant="ghost" className="block h-auto w-full overflow-hidden rounded-md border border-border bg-background p-0 transition-transform duration-500 motion-safe:hover:-translate-y-1">
                <a href={w.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${w.title} website (opens in a new tab)`}>
                  <img src={w.preview} alt={`${w.title} landing page built by Keeley Zou`} width={2560} height={1600} loading="lazy" className="aspect-[8/5] w-full object-cover" />
                </a>
              </Button>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl">{w.title}</h3>
                <Button asChild variant="link" className="h-auto shrink-0 p-0 text-sm text-muted-foreground">
                  <a href={w.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${w.domain} (opens in a new tab)`}>{w.domain}<ArrowUpRight className="size-4" /></a>
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Landing page design & build</p>
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
              I'm a marketing designer with 2+ years of experience bringing strategy and creative thinking together.
              I focus on who we're speaking to, what we want to say and how the design can make that message clearer.
              From campaign concepts to everyday brand content, I aim to create work that looks good and serves a clear purpose.
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
         <h2 className="font-display text-4xl font-bold md:text-6xl">Let's work together.</h2>
        <Button asChild size="lg" className="mt-8"><a href="mailto:keeeleyz@gmail.com">keeeleyz@gmail.com <ArrowUpRight /></a></Button>
        <p className="mt-16 text-sm text-muted-foreground">© 2026 Keeley Zou</p>
      </section>
    </main>
  );
}
