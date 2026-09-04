"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useGraphicsCapability, useIsMobile } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { DishArt } from "./fallback/DishArt";
import type { ModelKey, Palette } from "./types";

/**
 * Heavy 3D is code-split away from the initial bundle and never rendered on the
 * server: `ssr: false` keeps three.js out of the HTML payload, and the dynamic
 * import means a device that ends up on the fallback never downloads it at all.
 */
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const DishScene = dynamic(() => import("./DishScene"), { ssr: false });

interface BaseProps {
  palette: Palette;
  className?: string;
  progressRef?: RefObject<number>;
  label?: string;
}

/**
 * Progressive enhancement in one place: the SVG art paints first (it is in the
 * initial HTML), then the WebGL scene fades over it once it has a frame. If the
 * device can't do WebGL, or the capability probe says it shouldn't, the art
 * simply stays.
 */
function VisualShell({
  model,
  palette,
  className,
  label,
  children,
  webgl,
}: BaseProps & {
  model: ModelKey;
  children: React.ReactNode;
  webgl: boolean;
}) {
  const [sceneVisible, setSceneVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!webgl) return;
    // A short beat after mount so the canvas has drawn its first frame before
    // we cross-fade — swapping on mount shows one black frame.
    timer.current = window.setTimeout(() => setSceneVisible(true), 180);
    return () => window.clearTimeout(timer.current);
  }, [webgl]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: sceneVisible ? 0 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden={sceneVisible}
      >
        <DishArt model={model} palette={palette} label={label} />
      </motion.div>

      {webgl ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: sceneVisible ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

export function HeroVisual({
  palette,
  progressRef,
  className,
  onReady,
}: BaseProps & { progressRef: RefObject<number>; onReady?: () => void }) {
  const capability = useGraphicsCapability();
  const reduced = useReducedMotion() ?? false;
  const compact = useIsMobile();
  const webgl = capability === "full" || capability === "reduced";

  return (
    <VisualShell
      model="chicken"
      palette={palette}
      className={className}
      webgl={webgl}
      label="Fire grilled chicken on a dark plate"
    >
      <HeroScene
        progressRef={progressRef}
        palette={palette}
        quality={capability === "full" ? "full" : "reduced"}
        reduced={reduced}
        compact={compact}
        onReady={onReady}
      />
    </VisualShell>
  );
}

export function DishVisual({
  model,
  palette,
  progressRef,
  className,
  label,
}: BaseProps & { model: ModelKey }) {
  const capability = useGraphicsCapability();
  const reduced = useReducedMotion() ?? false;
  const webgl = capability === "full" || capability === "reduced";

  return (
    <VisualShell
      model={model}
      palette={palette}
      className={className}
      webgl={webgl}
      label={label}
    >
      <DishScene
        model={model}
        palette={palette}
        quality={capability === "full" ? "full" : "reduced"}
        reduced={reduced}
        progressRef={progressRef}
      />
    </VisualShell>
  );
}
