"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { site } from "@/config/site";
import { signatureDishes } from "@/data/menu";
import { HeroVisual } from "@/components/three/DishVisual";
import { RevealLines } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { OrderButton } from "@/components/ui/OrderButton";
import { generalOrderMessage } from "@/lib/whatsapp";

const hero = signatureDishes[0];

/**
 * Entrance order (spec §6): background → 3D → headline → supporting copy →
 * navigation (in `Nav`) → CTAs. Delays are absolute rather than chained so a
 * slow WebGL init can't stall the type.
 */
const BEAT = {
  scene: 0.15,
  headline: 0.42,
  copy: 0.95,
  cta: 1.15,
  footer: 1.35,
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();

  // Hero scroll progress feeds the 3D camera rig. Written to a ref, never to
  // state, so scrolling the hero re-renders nothing.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progressRef.current = value;
  });

  return (
    <section
      ref={sectionRef}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Introduction"
    >
      <div className="ember-wash pointer-events-none absolute inset-0 -z-10" />

      {/* 3D / fallback stage — sits high and centre so the headline reads
          across its lower third rather than fighting it. */}
      <div className="absolute inset-x-0 top-[4svh] bottom-[30svh] md:top-[2svh] md:bottom-[26svh]">
        <HeroVisual palette={hero.palette} progressRef={progressRef} />
        {/* Vignette: pulls the plate edge back into the dark and keeps the
            focus on the centre of the composition. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 54% at 50% 48%, transparent 0%, transparent 46%, rgba(10,8,6,0.55) 78%, var(--color-ink) 100%)",
          }}
        />
      </div>

      {/* Scrim so the headline always has contrast over the plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55svh] bg-gradient-to-t from-ink via-ink/80 to-transparent"
      />

      <div className="shell relative z-10 mt-auto flex flex-col gap-8 pb-10 pt-[18svh] md:pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h1 className="type-display text-[clamp(2.6rem,7.6vw,7.5rem)] text-cream">
            <RevealLines
              lines={["Bold flavour.", "Made memorable."]}
              delay={BEAT.headline}
              stagger={0.11}
              immediate
              lineClassName="block whitespace-nowrap"
            />
          </h1>

          <motion.div
            className="max-w-sm shrink-0 lg:pb-3"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: reduced ? 0 : BEAT.copy,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className="text-balance text-sm leading-relaxed text-cream-dim md:text-base">
              Chicken brined for twelve hours, finished over open coals, and out
              of the pass in minutes. No accounts, no checkout — you order on
              WhatsApp and we start cooking.
            </p>

            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: reduced ? 0 : BEAT.cta,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ButtonLink href="/menu" size="lg" arrow>
                Explore the menu
              </ButtonLink>
              <OrderButton
                message={generalOrderMessage()}
                variant="outline"
                size="lg"
              >
                Order now
              </OrderButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="flex items-end justify-between gap-6 border-t border-line pt-5"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: reduced ? 0 : BEAT.footer }}
        >
          <p className="type-label">
            Flame-grilled since {site.founded} — {site.address.line2},{" "}
            {site.address.city}
          </p>

          <a
            href="#flavour"
            className="group hidden items-center gap-3 text-[0.6875rem] uppercase tracking-[0.22em] text-cream-dim transition-colors duration-200 hover:text-cream sm:flex"
          >
            Scroll
            <span
              aria-hidden
              className="relative block h-8 w-px overflow-hidden bg-ink-line"
            >
              <span className="absolute inset-x-0 top-0 block h-3 animate-[scrollcue_2.2s_var(--ease-in-out-quart)_infinite] bg-ember" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
