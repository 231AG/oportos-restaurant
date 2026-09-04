"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Below the `md` breakpoint — used to drop WebGL work, not just resize it. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

/** Coarse pointer → no hover affordances, no magnetic buttons. */
export const useIsTouch = () => useMediaQuery("(pointer: coarse)");

export type Capability = "unknown" | "full" | "reduced" | "none";

/**
 * Decides how much WebGL this device should get.
 *  - `none`    → no WebGL context available; render the CSS/SVG art instead.
 *  - `reduced` → context exists but the device is small/weak: fewer segments,
 *                no shadows, no particles, lower DPR.
 *  - `full`    → everything on.
 */
export function useGraphicsCapability(): Capability {
  const [capability, setCapability] = useState<Capability>("unknown");

  useEffect(() => {
    let cancelled = false;

    // Deferred so the probe never competes with first paint.
    const id = window.setTimeout(() => {
      if (cancelled) return;

      let supported = false;
      try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl2") ??
          canvas.getContext("webgl")) as WebGLRenderingContext | null;
        supported = Boolean(gl);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        supported = false;
      }

      if (!supported) {
        setCapability("none");
        return;
      }

      const nav = navigator as Navigator & { deviceMemory?: number };
      const weak =
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
        (navigator.hardwareConcurrency ?? 8) <= 4 ||
        window.matchMedia("(max-width: 767px)").matches;

      setCapability(weak ? "reduced" : "full");
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return capability;
}

/** True after the element has entered the viewport at least once. */
export function useInViewOnce<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = "200px",
) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, seen]);

  return seen;
}
