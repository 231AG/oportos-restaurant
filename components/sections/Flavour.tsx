"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { RevealLines, Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Marquee } from "@/components/ui/Marquee";

/**
 * Ingredients that drift on scroll depth and pointer.
 *
 * Deliberately four objects on fixed paths, not a particle field: the brief is
 * an ingredient *composition*, and things flying around the screen is exactly
 * what makes a site feel like a template.
 */
const INGREDIENTS = [
  {
    label: "Charred chilli",
    x: "68%",
    y: "14%",
    size: 150,
    depth: 120,
    shape: "chilli" as const,
    rotate: -18,
  },
  {
    label: "Bay leaf",
    x: "87%",
    y: "34%",
    size: 132,
    depth: 90,
    shape: "leaf" as const,
    rotate: 24,
  },
  {
    label: "Peppercorns",
    x: "60%",
    y: "46%",
    size: 86,
    depth: 190,
    shape: "pepper" as const,
    rotate: 12,
  },
  {
    label: "Smoked garlic",
    x: "80%",
    y: "72%",
    size: 112,
    depth: 150,
    shape: "garlic" as const,
    rotate: -8,
  },
];

export function Flavour() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.5,
  });

  return (
    <section
      id="flavour"
      ref={sectionRef}
      className="grain relative overflow-hidden border-t border-line py-28 md:py-40"
      aria-labelledby="flavour-heading"
    >
      {!reduced
        ? INGREDIENTS.map((ingredient) => (
            <Ingredient key={ingredient.label} {...ingredient} progress={smooth} />
          ))
        : null}

      <div className="shell relative">
        <SectionHeader index="01" label="Our flavour" />

        <h2
          id="flavour-heading"
          className="type-display mt-10 text-[clamp(2.2rem,7.4vw,6.6rem)] text-cream"
        >
          <RevealLines
            lines={["We don't just", "serve food."]}
            stagger={0.09}
          />
          <RevealLines
            lines={["We create the", "experience."]}
            className="text-ember"
            delay={0.12}
            stagger={0.09}
          />
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5 md:col-start-1" delay={0.05}>
            <p className="max-w-md text-sm leading-relaxed text-cream-dim md:text-base">
              Everything starts with the marinade — peri-peri, citrus, garlic,
              salt — and twelve hours of patience. Then it&rsquo;s coals, tongs
              and attention. Nothing is cooked twice. Nothing sits under a lamp.
            </p>
          </Reveal>

          <Reveal className="md:col-span-4 md:col-start-8" delay={0.14}>
            <dl className="space-y-6">
              {[
                { term: "12 hours", detail: "in the peri brine, every bird" },
                { term: "600°C", detail: "over open coals on the pass" },
                { term: "3 heats", detail: "mild, hot, and the one we warn you about" },
              ].map((stat) => (
                <div key={stat.term} className="border-t border-line pt-4">
                  <dt className="font-display text-3xl leading-none text-cream md:text-4xl">
                    {stat.term}
                  </dt>
                  <dd className="mt-2 text-xs uppercase tracking-[0.18em] text-subtle">
                    {stat.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <Marquee
          items={["Peri-peri", "Open coals", "Citrus", "Smoke", "Charred lemon"]}
          duration={48}
        />
      </div>
    </section>
  );
}

function Ingredient({
  x,
  y,
  size,
  depth,
  rotate,
  shape,
  label,
  progress,
}: (typeof INGREDIENTS)[number] & {
  progress: ReturnType<typeof useSpring>;
}) {
  const translateY = useTransform(progress, [0, 1], [depth, -depth]);
  const rotation = useTransform(progress, [0, 1], [rotate - 10, rotate + 10]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute hidden md:block"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        y: translateY,
        rotate: rotation,
        filter: "drop-shadow(0 0 28px rgba(255,91,35,0.22))",
      }}
    >
      <IngredientShape shape={shape} label={label} />
    </motion.div>
  );
}

function IngredientShape({
  shape,
  label,
}: {
  shape: "chilli" | "pepper" | "leaf" | "garlic";
  label: string;
}) {
  const common = "h-full w-full opacity-90";

  if (shape === "chilli") {
    return (
      <svg viewBox="0 0 100 100" className={common} role="img" aria-label={label}>
        <path
          d="M22 74c18 8 44 2 52-18 5-12 1-24-6-30 2 9-1 16-6 20 3-14-4-24-14-27 5 10 3 19-3 25-8 8-20 12-27 20-3 4-3 8 4 10Z"
          fill="#8E1B10"
        />
        <path
          d="M62 24c3-6 8-9 14-9-2 5-6 9-11 11Z"
          fill="#2f4a1c"
        />
      </svg>
    );
  }

  if (shape === "leaf") {
    return (
      <svg viewBox="0 0 100 100" className={common} role="img" aria-label={label}>
        <path
          d="M50 8c22 14 30 40 18 62-6 12-16 20-24 22-6-16-10-32-6-50 3-14 8-25 12-34Z"
          fill="#2f4a1c"
        />
        <path d="M50 12v78" stroke="#557a2f" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (shape === "garlic") {
    return (
      <svg viewBox="0 0 100 100" className={common} role="img" aria-label={label}>
        <path
          d="M50 14c10 10 22 24 22 40 0 16-10 28-22 28S28 70 28 54c0-16 12-30 22-40Z"
          fill="#d8ccb8"
          opacity="0.55"
        />
        <path d="M50 18v64" stroke="#0a0806" strokeWidth="1.5" opacity="0.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={common} role="img" aria-label={label}>
      {[
        [28, 34, 11],
        [58, 24, 8],
        [46, 58, 13],
        [72, 62, 9],
        [30, 72, 7],
      ].map(([cx, cy, r], index) => (
        <circle key={index} cx={cx} cy={cy} r={r} fill="#2A1A12" />
      ))}
    </svg>
  );
}
