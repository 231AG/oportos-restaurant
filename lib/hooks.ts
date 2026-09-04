"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Media queries as an external store rather than state-in-an-effect: React
 * subscribes directly to `matchMedia`, so there is no extra render on mount and
 * no cascading update during hydration.
 */
export function useMediaQuery(query: string, defaultValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Below the `md` breakpoint — used to drop WebGL work, not just resize it. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

/** Coarse pointer → no hover affordances, no magnetic buttons. */
export const useIsTouch = () => useMediaQuery("(pointer: coarse)");

/** True once the page has scrolled past `threshold` px. */
export function useScrolledPast(threshold = 40) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
  }, []);

  const getSnapshot = useCallback(
    () => window.scrollY > threshold,
    [threshold],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

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

    // Deferred so the probe never competes with first paint, and so the state
    // update happens in a callback rather than synchronously in the effect.
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
