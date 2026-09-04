"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Total travel in px across the element's full pass through the viewport. */
  distance?: number;
  /** Slight scale drift; keep small or it reads as a zoom. */
  scaleFrom?: number;
  children_key?: string;
}

export function Parallax({
  children,
  className,
  distance = 90,
  scaleFrom = 1,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  const y = useTransform(smooth, [0, 1], [distance, -distance]);
  const scale = useTransform(smooth, [0, 0.5, 1], [scaleFrom, 1, scaleFrom]);

  if (reduced) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn(className)}>
      <motion.div style={{ y, scale }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
