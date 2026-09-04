"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import type { Quality } from "./types";

interface SceneCanvasProps {
  children: ReactNode;
  quality: Quality;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  /** Pointer events are off by default — the scene reacts, it isn't clicked. */
  interactive?: boolean;
}

/**
 * Shared canvas host.
 *
 * Two things here matter more than anything inside the scene:
 *  1. `frameloop` flips to `never` whenever the canvas is off-screen or the tab
 *     is hidden, so a scrolled-past hero costs nothing.
 *  2. DPR is capped (and adaptively lowered by drei) — an uncapped DPR on a 3×
 *     phone screen is the difference between 60fps and 20.
 */
export function SceneCanvas({
  children,
  quality,
  className,
  cameraPosition = [0, 1.9, 5.4],
  fov = 38,
  interactive = false,
}: SceneCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const full = quality === "full";

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    let onScreen = true;
    let visible = !document.hidden;
    const sync = () => setActive(onScreen && visible);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(node);

    const onVisibility = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={hostRef} className={cn("h-full w-full", className)}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, full ? 1.9 : 1.4]}
        shadows={full ? "soft" : false}
        camera={{ position: cameraPosition, fov, near: 0.1, far: 40 }}
        gl={{
          antialias: full,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.92;
        }}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 120 } }}
      >
        <Suspense fallback={null}>
          {children}
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
