"use client";

import { useEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { SceneCanvas } from "./SceneCanvas";
import { Lighting } from "./Lighting";
import { Embers } from "./Embers";
import { DishStage, type StagePose } from "./DishStage";
import type { Palette, Quality } from "./types";

/**
 * Hero camera move: from a low, close three-quarter view of the bird to a high
 * pass-side look-down as the page scrolls into "Our Flavor". The dish also
 * turns ~70° across the move, so the char on the far side comes into view.
 */
const HERO_POSE: StagePose = {
  from: {
    camera: [0.1, 1.15, 3.85],
    target: [0, 0.46, 0],
    scale: 1.2,
    rotationY: -0.4,
  },
  to: {
    camera: [0.55, 4.3, 2.35],
    target: [0, 0.24, 0],
    scale: 0.92,
    rotationY: 0.85,
  },
};

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    if (!gl) return;
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [gl, onReady]);
  return null;
}

interface HeroSceneProps {
  progressRef: RefObject<number>;
  palette: Palette;
  quality: Quality;
  reduced: boolean;
  onReady?: () => void;
}

export default function HeroScene({
  progressRef,
  palette,
  quality,
  reduced,
  onReady,
}: HeroSceneProps) {
  const full = quality === "full";

  return (
    <SceneCanvas
      quality={quality}
      cameraPosition={HERO_POSE.from.camera}
      fov={38}
    >
      <ReadySignal onReady={onReady} />
      <Lighting quality={quality} rim={palette.glow} />
      <DishStage
        model="chicken"
        palette={palette}
        quality={quality}
        reduced={reduced}
        progressRef={progressRef}
        pose={HERO_POSE}
        spin={0.075}
        pointerStrength={full ? 1 : 0.45}
        shadows
      />
      {full && !reduced ? (
        <Embers count={70} color={palette.glow} animate radius={3.6} height={5.4} />
      ) : null}
    </SceneCanvas>
  );
}
