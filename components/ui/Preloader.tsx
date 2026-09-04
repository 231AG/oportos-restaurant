"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/config/site";

const SESSION_KEY = "oportos.intro.seen";
/** Hard ceiling — the intro is a flourish, never a gate. */
const MAX_DURATION = 1100;

/**
 * A short cinematic curtain: the wordmark sits on black behind a rising ember
 * rule, then the whole panel wipes upward to reveal the hero.
 *
 * It is skipped entirely on repeat visits within a session and under reduced
 * motion, and it never blocks interaction for longer than ~1.1s even on a slow
 * connection — the page underneath is already rendered.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage blocked — show it, it's cheap */
    }
    if (seen) return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }, MAX_DURATION);

    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="relative flex flex-col items-center">
            <motion.span
              className="font-display text-[13vw] uppercase leading-none tracking-[0.02em] text-cream md:text-[7vw]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {site.name}
            </motion.span>

            <div className="mt-5 h-px w-[42vw] max-w-md overflow-hidden bg-ink-line md:w-[18vw]">
              <motion.span
                className="block h-full w-full origin-left bg-ember"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: MAX_DURATION / 1000, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
