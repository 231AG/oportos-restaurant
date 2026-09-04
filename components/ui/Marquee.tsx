"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full pass. Slower reads as confident, faster as noisy. */
  duration?: number;
  reverse?: boolean;
}

/**
 * A single translate animation on a doubled track — no JS ticker, no layout
 * thrash. Frozen (and centred) under reduced motion rather than hidden.
 */
export function Marquee({
  items,
  className,
  duration = 42,
  reverse = false,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const track = [...items, ...items];

  return (
    <div
      className={cn("mask-fade-x relative w-full overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform"
        style={
          reduced
            ? undefined
            : {
                animation: `marquee ${duration}s linear infinite`,
                animationDirection: reverse ? "reverse" : "normal",
              }
        }
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="type-display text-[clamp(2rem,5vw,4.5rem)] text-cream/18">
              {item}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
          </span>
        ))}
      </div>
    </div>
  );
}
