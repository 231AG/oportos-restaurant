"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/config/site";

export function StoryTeaser() {
  return (
    <section
      className="relative overflow-hidden border-t border-line py-24 md:py-32"
      aria-labelledby="story-heading"
    >
      <div className="shell grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <SectionHeader index="04" label="Our story" />
          <h2
            id="story-heading"
            className="type-display mt-8 text-[clamp(2.2rem,6vw,5rem)] text-cream"
          >
            <RevealLines lines={["One grill.", "One obsession."]} />
          </h2>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-cream-dim md:text-base">
              We opened in {site.founded} with a second-hand grill, a family peri
              recipe and a stubborn idea: that a chicken shop could be worth
              travelling for. The grill has been replaced twice. The recipe
              hasn&rsquo;t changed once.
            </p>
            <ButtonLink href="/story" variant="outline" className="mt-8" arrow>
              Read the story
            </ButtonLink>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Parallax distance={60}>
            <figure className="relative">
              <blockquote className="type-editorial text-[clamp(1.6rem,3.4vw,2.8rem)] leading-[1.15] text-cream">
                &ldquo;If it doesn&rsquo;t come off the coals, it doesn&rsquo;t
                leave the kitchen.&rdquo;
              </blockquote>
              <figcaption className="mt-6 type-label">
                Ana Ferreira — head of the grill
              </figcaption>
            </figure>
          </Parallax>

          <div className="mt-14 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {[
              { value: "2014", label: "Opened" },
              { value: "12h", label: "Brine" },
              { value: "600°", label: "Coals" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl leading-none text-ember md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[0.625rem] uppercase tracking-[0.2em] text-subtle">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
