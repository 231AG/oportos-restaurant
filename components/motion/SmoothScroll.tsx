"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { installFrameListeners } from "@/lib/frame-store";
import { useIsTouch } from "@/lib/hooks";

/**
 * Smooth scroll + shared frame listeners.
 *
 * Lenis only interpolates the scroll position — wheel, keyboard, scrollbar and
 * anchor behaviour are untouched, so this is not scroll hijacking. It is turned
 * off completely for touch devices (native momentum is better) and for
 * `prefers-reduced-motion`.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => installFrameListeners(), []);

  useEffect(() => {
    if (reduced || touch) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Keep in-page anchors working with the interpolated scroller.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced, touch]);

  return null;
}
