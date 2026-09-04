"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full pass at rest. Slow reads as confident. */
  duration?: number;
  reverse?: boolean;
}

/**
 * Scroll-reactive marquee.
 *
 * This is the one place GSAP earns its place over Framer Motion: the track runs
 * on an infinite `xPercent` tween whose `timeScale` is driven by scroll
 * velocity, and whose direction flips when the user scrolls back up. Framer's
 * declarative model has no good equivalent for "keep looping, but faster and
 * backwards while the page is moving", and ScrollTrigger's velocity readout is
 * exactly the input needed.
 *
 * Under reduced motion the track is static — the words are still readable, they
 * simply don't move.
 */
export function Marquee({
  items,
  className,
  duration = 42,
  reverse = false,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const track = [...items, ...items];

  useEffect(() => {
    const node = trackRef.current;
    if (!node || reduced) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    // GSAP + ScrollTrigger are ~110KB and every marquee on this site is below
    // the fold, so they load after first paint rather than in the entry chunk.
    // The markup still renders server-side; only the motion is deferred.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        // The track holds two copies of the list, so a −50% travel is exactly
        // one seamless loop. Reversed marquees start pre-shifted and travel
        // back to 0.
        if (reverse) gsap.set(node, { xPercent: -50 });

        const tween = gsap.to(node, {
          xPercent: reverse ? 0 : -50,
          duration,
          ease: "none",
          repeat: -1,
        });

        // `speed` is tweened rather than set, so the marquee eases back to its
        // resting pace instead of snapping when the scroll stops.
        const state = { speed: 1 };

        ScrollTrigger.create({
          trigger: node,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = Math.abs(self.getVelocity());
            gsap.to(state, {
              speed: 1 + Math.min(velocity / 900, 4),
              duration: 0.35,
              overwrite: true,
              onUpdate: () => {
                tween.timeScale(state.speed * (self.direction === -1 ? -1 : 1));
              },
            });
          },
        });
      }, node);

      dispose = () => context.revert();
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [duration, reduced, reverse]);

  return (
    <div
      className={cn("mask-fade-x relative w-full overflow-hidden", className)}
      aria-hidden
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform"
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            {/* /45 rather than /18: at display size this still reads as a
                background band, but it clears the 3:1 large-text floor. */}
            <span className="type-display text-[clamp(2rem,5vw,4.5rem)] text-cream/45">
              {item}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
          </span>
        ))}
      </div>
    </div>
  );
}
