"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { Quality } from "./types";

interface LightingProps {
  quality: Quality;
  /** Ember tone used for the rim light — usually the active dish's glow. */
  rim?: string;
}

/**
 * Restaurant-pass lighting: one hard warm key from high front-right (the pass
 * lamp), a saturated ember rim from behind to separate the food from the black
 * background, and a very low cool fill so the shadow side doesn't go dead.
 *
 * At `reduced` quality the IBL environment is skipped entirely — it is the
 * single most expensive thing in the scene and the analytic lights carry the
 * look on their own.
 */
export function Lighting({ quality, rim = "#ff5b23" }: LightingProps) {
  const full = quality === "full";

  return (
    <>
      <ambientLight intensity={0.26} color="#f0d3b6" />

      <spotLight
        position={[2.4, 5.4, 2.6]}
        angle={0.46}
        penumbra={0.9}
        intensity={110}
        color="#ffd7ac"
        castShadow={full}
        shadow-mapSize={full ? [1024, 1024] : [512, 512]}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />

      {/* Ember rim from behind-left — this is what separates the food from the
          near-black background without lifting the background itself. */}
      <spotLight
        position={[-3.4, 1.9, -3.0]}
        angle={0.95}
        penumbra={1}
        intensity={120}
        color={rim}
      />

      {/* Second rim, opposite side, tighter and hotter. */}
      <pointLight position={[2.4, 1.3, -2.2]} intensity={14} color={rim} />

      {/* Cool fill, deliberately weak — the scene should stay warm. */}
      <pointLight position={[-2.6, 1.4, 3.2]} intensity={16} color="#6d86b0" />

      {/* Bounce off the plate, kept low so the ceramic never lifts to brown. */}
      <pointLight position={[0, 0.35, 1.2]} intensity={4} color="#ff8a4c" />

      {full ? (
        <Environment resolution={64} frames={1} background={false}>
          <Lightformer
            form="rect"
            intensity={2.4}
            color="#ffcf9e"
            position={[3, 4, 2]}
            rotation={[-Math.PI / 3, 0, 0]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            form="circle"
            intensity={1.6}
            color={rim}
            position={[-4, 1, -3]}
            scale={[5, 5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.5}
            color="#3c4a63"
            position={[0, -3, 2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[8, 8, 1]}
          />
        </Environment>
      ) : null}
    </>
  );
}
