import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphicWall } from "@/components/GraphicWall";
import { portfolioWork } from "@/lib/portfolio-work";
import { experience } from "@/lib/experience";
import keeleyPortrait from "@/assets/keeley-portrait-trimmed.png";

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

const services = ["Landing page design & build", "Brand & social graphics", "Search & AI visibility", "Video content & editing", "Outreach automation", "Creator & affiliate marketing"];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground">
        <nav aria-label="Main navigation" className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-5 text-sm">
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
          <h1 className="font-greeting text-2xl font-medium sm:text-4xl">Hi, I'm Keeley Zou</h1>
        </div>
        <div className="flex justify-center sm:hidden">
          <img src={keeleyPortrait} alt="Illustrated portrait of Keeley Zou" width={1920} height={1920} className="h-64 w-auto object-contain" />
        </div>
        <div className="split-roles">
          <div className="role-copy role-marketer">
            <div className="role-head group/role">
              <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">marketer</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">Audience-led brand stories, campaigns and content that connect.</p>
              <div className="role-details absolute left-0 top-full z-20 -mt-4 w-max max-w-[80vw] overflow-hidden">
                <ul className="dash-list mt-0 space-y-4 whitespace-nowrap text-sm leading-6 text-muted-foreground">
                  <li>Campaign strategy and concept development</li>
                  <li>Audience research and messaging frameworks</li>
                  <li>Social and content planning that builds momentum</li>
                  <li>Go-to-market plans that turn attention into signups</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="portrait-space hidden sm:block">
            <img src={keeleyPortrait} alt="Illustrated portrait of Keeley Zou" width={1920} height={1920} className="portrait-img h-[min(72vh,620px)] w-auto max-w-none object-contain" />
          </div>
          <div className="role-copy role-designer">
            <div className="role-head group/role">
              <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">designer</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">AI-native design for landing pages and brand visuals, balancing aesthetics and clarity.</p>
              <div className="role-details absolute left-0 top-full z-20 -mt-4 w-max max-w-[80vw] overflow-hidden">
                <ul className="dash-list mt-0 space-y-4 whitespace-nowrap text-sm leading-6 text-muted-foreground">
                  <li>Landing pages designed and built end to end</li>
                  <li>Brand visuals and identity systems</li>
                  <li>AI-assisted workflows for faster, sharper output</li>
                  <li>Conversion-focused layouts that turn visitors into customers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="work">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Selected work</h2>
        <div className="work-fan">
          {portfolioWork.map((w) => (
            <a key={w.title} href={w.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${w.title} website (opens in a new tab)`} className="work-card group">
              <img src={w.preview} alt={`${w.title} landing page built by Keeley Zou`} width={2560} height={1600} loading="lazy" className="work-card-img" />
              <span className="work-card-caption">
                <span className="font-display text-2xl">{w.title}</span>
                <span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">{w.domain}<ArrowUpRight className="size-4" /></span>
                <span className="mt-2 text-xs text-muted-foreground">Landing page design & build</span>
              </span>
            </a>
          ))}
        </div>
        </div>
      </section>

      <section id="graphics" aria-labelledby="graphics-heading">
        <div className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
          <h2 id="graphics-heading" className="mb-4 text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Brand and social graphics design</h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">Artwork for events, social and brand.</p>
          <GraphicWall />
        </div>
      </section>

      <section id="about">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-bold">Hi, I'm Keeley.</h2>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              I'm a marketing designer with 2+ years of experience bringing strategy and creative thinking together.
              I focus on who we're speaking to, what we want to say and how the design can make that message clearer.
              From campaign concepts to everyday brand content, I aim to create work that looks good and serves a clear purpose.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 self-end">
            {services.map((s) => (
              <li key={s} className="skills-font border-t border-border pt-3">{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="experience">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Experience</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {experience.map((e) => (
              <article key={e.company} className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{e.field}</span>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 font-display text-3xl font-bold hover:underline">
                  {e.company}<ArrowUpRight className="size-5" />
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{e.role} · {e.period}</p>
                <p className="mt-4">{e.summary}</p>
                <ul className="dash-list mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  {e.highlights.map((h) => <li key={h} className="!opacity-100 !transform-none">{h}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-24 text-center">
         <h2 className="font-display text-4xl font-bold md:text-6xl">Let's work together.</h2>
        <Button asChild size="lg" className="mt-8"><a href="mailto:keeeleyz@gmail.com"><Mail /> keeeleyz@gmail.com</a></Button>
      </section>
    </main>
  );
}
