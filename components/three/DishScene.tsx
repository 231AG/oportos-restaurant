"use client";

import type { RefObject } from "react";
import { SceneCanvas } from "./SceneCanvas";
import { Lighting } from "./Lighting";
import { DishStage, type StagePose } from "./DishStage";
import type { ModelKey, Palette, Quality } from "./types";

/** Tighter, more product-like framing than the hero, with a slow drift. */
const SHOWCASE_POSE: StagePose = {
  from: {
    camera: [0.2, 1.55, 4.55],
    target: [0, 0.5, 0],
    scale: 1.0,
    rotationY: 0.25,
  },
  to: {
    camera: [-0.75, 2.5, 4.05],
    target: [0, 0.42, 0],
    scale: 1.06,
    rotationY: -0.55,
  },
};

interface DishSceneProps {
  model: ModelKey;
  palette: Palette;
  quality: Quality;
  reduced: boolean;
  progressRef?: RefObject<number>;
}

export default function DishScene({
  model,
  palette,
  quality,
  reduced,
  progressRef,
}: DishSceneProps) {
  return (
    <SceneCanvas
      quality={quality}
      cameraPosition={SHOWCASE_POSE.from.camera}
      fov={36}
    >
      <Lighting quality={quality} rim={palette.glow} />
      <DishStage
        model={model}
        palette={palette}
        quality={quality}
        reduced={reduced}
        progressRef={progressRef}
        pose={SHOWCASE_POSE}
        spin={0.06}
        pointerStrength={quality === "full" ? 0.8 : 0.35}
        shadows={quality === "full"}
      />
    </SceneCanvas>
  );
}
