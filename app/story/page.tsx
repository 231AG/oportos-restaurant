import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Marquee } from "@/components/ui/Marquee";
import { ButtonLink } from "@/components/ui/Button";
import { DishArt } from "@/components/three/fallback/DishArt";
import { signatureDishes } from "@/data/menu";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How OPORTOS started: one second-hand grill, a family peri-peri recipe, and a refusal to cook anything twice.",
};

const chapters = [
  {
    year: "2014",
    title: "A second-hand grill",
    body: "We took over a shuttered unit on Ember Yard with more debt than equipment. The first grill came off a restaurant clearance in Bermondsey and is still in the back, retired but not thrown out.",
  },
  {
    year: "2017",
    title: "The brine that stayed",
    body: "Twelve hours became non-negotiable. Shorter and the peri sits on the surface; longer and the citrus starts to cook the meat. It is the one thing on this site we will argue about.",
  },
  {
    year: "2021",
    title: "Ordering, without the app",
    body: "We tried three delivery platforms and disliked all of them. Now you message us. A person reads it, a person replies, and the bird goes on when you're actually on your way.",
  },
  {
    year: "Today",
    title: "Same fire",
    body: "Two grills, one counter, and a queue that starts at six. Nothing is cooked twice. Nothing sits under a lamp.",
  },
];

export default function StoryPage() {
  const dish = signatureDishes[2];

  return (
    <>
      <PageHeader
        index="02"
        label="Our story"
        title={["One grill.", "One obsession."]}
        lede={`Opened in ${site.founded} on a street nobody walked down, with a family recipe and a stubborn idea about what a chicken shop could be.`}
      />

      <div className="shell pb-24 md:pb-32">
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <ol className="border-t border-line">
              {chapters.map((chapter, index) => (
                <Reveal
                  as="li"
                  key={chapter.year}
                  className="grid gap-3 border-b border-line py-10 md:grid-cols-[7rem_1fr] md:gap-8"
                  delay={index * 0.05}
                >
                  <span className="font-display text-2xl leading-none text-ember">
                    {chapter.year}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl uppercase leading-none text-cream md:text-3xl">
                      {chapter.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream-dim">
                      {chapter.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <Parallax distance={70}>
              <div
                className="relative aspect-[4/5] w-full border border-line"
                style={{ backgroundColor: dish.palette.wash }}
              >
                <DishArt
                  model={dish.model}
                  palette={dish.palette}
                  label="Coal-fired ribs illustration"
                />
              </div>
            </Parallax>

            <Reveal delay={0.1}>
              <figure className="mt-10">
                <blockquote className="type-editorial text-2xl leading-tight text-cream">
                  &ldquo;We don&rsquo;t have a signature sauce. We have a
                  signature fire.&rdquo;
                </blockquote>
                <figcaption className="mt-4 type-label">
                  Ana Ferreira — head of the grill
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        <div className="mt-24 border-t border-line pt-12 md:mt-32">
          <Marquee items={["No shortcuts", "No lamps", "No second cook"]} duration={50} />
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/menu" size="lg" arrow>
              See the menu
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Find us
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
