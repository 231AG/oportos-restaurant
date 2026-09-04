"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { RevealLines } from "@/components/motion/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { ButtonLink } from "@/components/ui/Button";

/**
 * The immersive beat: no product, no price — just the room, the heat and one
 * line of copy. Depth comes from four layers moving at different rates and a
 * heat bloom that opens up as the section crosses the viewport.
 */
export function Immersive() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.5,
  });

  const bloomScale = useTransform(smooth, [0, 0.5, 1], [0.55, 1.25, 0.7]);
  const bloomOpacity = useTransform(smooth, [0, 0.45, 1], [0.15, 0.85, 0.2]);
  const smokeY = useTransform(smooth, [0, 1], [140, -140]);
  const emberY = useTransform(smooth, [0, 1], [60, -180]);
  const copyY = useTransform(smooth, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      className="grain relative flex min-h-[112svh] items-center overflow-hidden border-t border-line bg-ink"
      aria-labelledby="immersive-heading"
    >
      {/* Heat bloom */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          scale: reduced ? 1 : bloomScale,
          opacity: reduced ? 0.5 : bloomOpacity,
          background:
            "radial-gradient(circle, rgba(255,91,35,0.55) 0%, rgba(158,27,16,0.28) 34%, rgba(10,8,6,0) 68%)",
          filter: "blur(28px)",
        }}
      />

      {/* Smoke layer */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{ y: reduced ? 0 : smokeY }}
      >
        <svg viewBox="0 0 1200 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="immersive-blur">
              <feGaussianBlur stdDeviation="46" />
            </filter>
          </defs>
          <g filter="url(#immersive-blur)" opacity="0.5">
            <ellipse cx="240" cy="620" rx="300" ry="120" fill="#3a1a10" />
            <ellipse cx="960" cy="220" rx="260" ry="140" fill="#2a1208" />
            <ellipse cx="620" cy="440" rx="360" ry="150" fill="#4a1c0c" />
          </g>
        </svg>
      </motion.div>

      {/* Ember specks — CSS only, so this layer costs nothing on mobile. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ y: reduced ? 0 : emberY }}
      >
        {EMBERS.map((ember, index) => (
          <span
            key={index}
            className="absolute block rounded-full bg-ember"
            style={{
              left: ember.x,
              top: ember.y,
              width: ember.size,
              height: ember.size,
              opacity: ember.opacity,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="shell relative w-full py-28 text-center"
        style={{ y: reduced ? 0 : copyY }}
      >
        <p className="type-label mx-auto">Inside the room</p>

        <h2
          id="immersive-heading"
          className="type-display mx-auto mt-8 max-w-[14ch] text-[clamp(2.6rem,9vw,8.5rem)] text-cream"
        >
          <RevealLines lines={["Come for the", "fire."]} stagger={0.1} />
        </h2>

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-cream-dim md:text-base">
          One long counter, an open grill, and the sound of coals. Book the room
          for a table of twenty, or take the whole thing away in a bag.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/story" variant="outline" size="lg" arrow>
            Our story
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost" size="lg">
            Find the room
          </ButtonLink>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-8">
        <Marquee
          items={["Open fire", "Shoreditch", "Since 2014", "No shortcuts"]}
          duration={56}
          reverse
        />
      </div>
    </section>
  );
}

/** Fixed positions — a random field would re-shuffle on every render. */
const EMBERS = [
  { x: "12%", y: "22%", size: 3, opacity: 0.6 },
  { x: "24%", y: "68%", size: 2, opacity: 0.4 },
  { x: "38%", y: "34%", size: 4, opacity: 0.5 },
  { x: "52%", y: "78%", size: 2, opacity: 0.35 },
  { x: "63%", y: "26%", size: 3, opacity: 0.55 },
  { x: "76%", y: "58%", size: 2, opacity: 0.45 },
  { x: "88%", y: "36%", size: 4, opacity: 0.5 },
  { x: "70%", y: "86%", size: 2, opacity: 0.3 },
  { x: "18%", y: "48%", size: 2, opacity: 0.4 },
];
