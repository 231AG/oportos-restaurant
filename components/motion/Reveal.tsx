"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled during the reveal, in px. */
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span";
}

/**
 * The workhorse entrance: a clip-path wipe plus a short vertical travel, so the
 * content is uncovered rather than faded in. Under reduced motion the element
 * is simply present — no travel, no wipe, no opacity flicker.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) return <MotionTag className={className}>{children}</MotionTag>;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y,
      clipPath: "inset(0% 0% 100% 0%)",
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        duration: 1.1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
    >
      {children}
    </MotionTag>
  );
}

interface RevealLinesProps {
  /** One string per visual line — line breaks stay under art direction. */
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Play immediately (hero) instead of on scroll into view. */
  immediate?: boolean;
}

/**
 * Masked line reveal for editorial headlines: each line sits in an
 * `overflow-hidden` track and slides up from below its own baseline, staggered.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  immediate = false,
}: RevealLinesProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={cn("block", className)}>
        {lines.map((line) => (
          <span key={line} className={cn("block", lineClassName)}>
            {line}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={cn("block", className)}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : {
            whileInView: "visible",
            viewport: { once: true, margin: "-15% 0px -15% 0px" },
          })}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        hidden: {},
      }}
    >
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            variants={{
              hidden: { y: "108%", rotate: 2.5 },
              visible: {
                y: "0%",
                rotate: 0,
                transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
