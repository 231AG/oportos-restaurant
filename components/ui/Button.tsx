"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/lib/hooks";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden " +
  "font-sans font-medium uppercase tracking-[0.16em] " +
  "transition-colors duration-200 ease-[var(--ease-out-expo)] " +
  "disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.6875rem]",
  lg: "h-14 px-7 text-xs",
};

const variants: Record<Variant, string> = {
  primary: "bg-ember text-ink hover:text-ink",
  outline:
    "border border-line-strong text-cream hover:border-ember hover:text-ember",
  ghost: "text-cream-dim hover:text-cream",
};

interface ButtonCoreProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Renders a small arrow that shifts on hover. */
  arrow?: boolean;
}

/**
 * Buttons get exactly two interactions: a magnetic pull toward the cursor and a
 * wipe on the label. Nothing else — the restraint is the point.
 */
function useMagnetic(strength = 0.32) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const enabled = !reduced && !touch;

  const handlers = enabled
    ? {
        onMouseMove: (event: React.MouseEvent) => {
          const node = ref.current;
          if (!node) return;
          const rect = node.getBoundingClientRect();
          setOffset({
            x: (event.clientX - (rect.left + rect.width / 2)) * strength,
            y: (event.clientY - (rect.top + rect.height / 2)) * strength,
          });
        },
        onMouseLeave: () => setOffset({ x: 0, y: 0 }),
      }
    : {};

  return { ref, offset, handlers, enabled };
}

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {/* Ember wash that rises from the bottom edge on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 translate-y-full bg-ember-deep transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-expo)] group-hover:translate-y-0"
      />
      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        {arrow ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3 w-3 transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-expo)] group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="square" />
          </svg>
        ) : null}
      </span>
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow,
  ...rest
}: ButtonCoreProps & ComponentProps<"button">) {
  const { ref, offset, handlers, enabled } = useMagnetic();

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      animate={enabled ? { x: offset.x, y: offset.y } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.5 }}
      className={cn(base, sizes[size], variants[variant], className)}
      {...handlers}
      {...(rest as ComponentProps<typeof motion.button>)}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </motion.button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow,
  href,
  external,
  ...rest
}: ButtonCoreProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href">) {
  const { ref, offset, handlers, enabled } = useMagnetic();
  const MotionLink = motion.create(Link);

  const shared = {
    ref: ref as React.Ref<HTMLAnchorElement>,
    animate: enabled ? { x: offset.x, y: offset.y } : undefined,
    transition: { type: "spring" as const, stiffness: 220, damping: 18, mass: 0.5 },
    className: cn(base, sizes[size], variants[variant], className),
    ...handlers,
  };

  if (external) {
    return (
      <motion.a
        {...shared}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...(rest as ComponentProps<typeof motion.a>)}
      >
        <Inner arrow={arrow}>{children}</Inner>
      </motion.a>
    );
  }

  return (
    <MotionLink {...shared} href={href} {...(rest as object)}>
      <Inner arrow={arrow}>{children}</Inner>
    </MotionLink>
  );
}
