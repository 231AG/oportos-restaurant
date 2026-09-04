"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { signatureDishes } from "@/data/menu";
import { DishVisual } from "@/components/three/DishVisual";
import { DishDetail } from "@/components/menu/DishDetail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { OrderButton } from "@/components/ui/OrderButton";
import { HeatScale } from "@/components/ui/HeatScale";
import { dishOrderMessage, formatMoney } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Each dish holds the sticky frame for this much scroll. */
const SEGMENT_VH = 90;

/**
 * Signature dishes as a sticky, scroll-advanced sequence rather than a grid of
 * cards: the 3D scene stays mounted and swaps its model, the background wash
 * crossfades to the dish's own tone, the number and copy transition, and the
 * whole thing is still operable by clicking the list.
 */
export function Signatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progressRef.current = value;
    const next = Math.min(
      signatureDishes.length - 1,
      Math.max(0, Math.floor(value * signatureDishes.length)),
    );
    setActive((current) => (current === next ? current : next));
  });

  const dish = signatureDishes[active];

  const goTo = (index: number) => {
    const node = sectionRef.current;
    if (!node) return;
    const top = node.offsetTop;
    const height = node.offsetHeight - window.innerHeight;
    const target = top + (height * (index + 0.4)) / signatureDishes.length;
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      id="signatures"
      ref={sectionRef}
      className="relative border-t border-line"
      style={{ height: `${signatureDishes.length * SEGMENT_VH + 40}vh` }}
      aria-labelledby="signatures-heading"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* Background wash follows the active dish. */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{ backgroundColor: dish.palette.wash }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="ember-wash pointer-events-none absolute inset-0 -z-10 opacity-70" />

        {/* Oversized dish number, cropped by the section edge. */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={dish.index}
            aria-hidden
            className="type-display pointer-events-none absolute -right-4 top-[8svh] text-[34vw] leading-[0.72] text-cream/6 md:top-[6svh]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -60 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {dish.index}
          </motion.span>
        </AnimatePresence>

        <div className="shell relative flex h-full flex-col pt-24 pb-8 md:pt-28">
          <div className="flex items-center justify-between">
            <SectionHeader index="02" label="Signature dishes" />
            <span className="hidden type-label md:block" id="signatures-heading">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(signatureDishes.length).padStart(2, "0")}
            </span>
          </div>

          <div className="relative mt-4 grid flex-1 grid-cols-1 items-center gap-4 md:mt-0 md:grid-cols-12 md:gap-8">
            {/* Visual */}
            <div className="relative order-1 h-[34svh] w-full md:order-2 md:col-span-7 md:col-start-6 md:h-[68svh]">
              <DishVisual
                model={dish.model}
                palette={dish.palette}
                progressRef={progressRef}
                label={`${dish.name} — 3D dish`}
              />
            </div>

            {/* Copy */}
            <div className="order-2 md:order-1 md:col-span-5 md:col-start-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={dish.id}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="type-editorial text-lg text-ember md:text-xl">
                    {dish.kicker}
                  </p>
                  <h3 className="type-display mt-3 text-[clamp(2.1rem,5.4vw,4.6rem)] text-cream">
                    {dish.name}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-cream-dim">
                    {dish.description}
                  </p>
                  <div className="mt-5 flex items-center gap-5">
                    <span className="font-display text-3xl leading-none text-cream">
                      {formatMoney(dish.price)}
                    </span>
                    <HeatScale level={dish.heat} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDetail(active)}
                      arrow
                    >
                      View dish
                    </Button>
                    <OrderButton message={dishOrderMessage(dish.name)}>
                      Order
                    </OrderButton>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dish index — clickable, and a progress rail on desktop. */}
          <nav
            aria-label="Signature dishes"
            className="mask-fade-x relative order-3 mt-4 flex gap-x-6 gap-y-2 overflow-x-auto border-t border-line pt-4 md:mt-0"
          >
            {signatureDishes.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "group flex shrink-0 items-center gap-2 whitespace-nowrap text-[0.6875rem] uppercase tracking-[0.18em] transition-colors duration-[var(--duration-micro)]",
                  index === active
                    ? "text-cream"
                    : "text-subtle hover:text-cream-dim",
                )}
              >
                <span className="font-display text-ember/80">{entry.index}</span>
                {entry.name}
                <span
                  aria-hidden
                  className={cn(
                    "block h-px w-6 origin-left bg-ember transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-expo)]",
                    index === active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </nav>
        </div>
      </div>

      <DishDetail
        dish={detail === null ? null : signatureDishes[detail]}
        onClose={() => setDetail(null)}
      />
    </section>
  );
}
