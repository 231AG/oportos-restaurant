"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { damp } from "@/lib/utils";
import { pointerState } from "@/lib/frame-store";
import { dishModels } from "./models";
import type { ModelKey, Palette, Quality } from "./types";

export interface StageKeyframe {
  camera: [number, number, number];
  target: [number, number, number];
  scale: number;
  rotationY: number;
}

export interface StagePose {
  from: StageKeyframe;
  to: StageKeyframe;
}

interface DishStageProps {
  model: ModelKey;
  palette: Palette;
  quality: Quality;
  reduced: boolean;
  /** 0…1 scroll progress for this section. Read every frame, never in state. */
  progressRef?: RefObject<number>;
  pose: StagePose;
  /** Idle rotation, radians/second. */
  spin?: number;
  pointerStrength?: number;
  shadows?: boolean;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The camera rig and the dish it looks at.
 *
 * Everything the scene reacts to — scroll progress, pointer, dish swaps — is
 * read from refs inside `useFrame` and damped toward its target, so the object
 * never snaps and React never re-renders during scroll. Under reduced motion
 * the rig holds the opening keyframe: no camera travel, no idle float, no
 * pointer parallax.
 */
export function DishStage({
  model,
  palette,
  quality,
  reduced,
  progressRef,
  pose,
  spin = 0.085,
  pointerStrength = 1,
  shadows = true,
}: DishStageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  // Dish swapping: the outgoing model shrinks away before the incoming one
  // rises in. Tracked in a ref so the transition costs no re-renders.
  const [rendered, setRendered] = useState<ModelKey>(model);
  const requested = useRef<ModelKey>(model);
  const presence = useRef(reduced ? 1 : 0);
  const lookAt = useRef(new THREE.Vector3(...pose.from.target));
  const idleSeed = useRef(Math.random() * 10);

  useEffect(() => {
    requested.current = model;
  }, [model]);

  useFrame((state, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;

    const delta = Math.min(rawDelta, 1 / 30);
    const time = state.clock.elapsedTime + idleSeed.current;
    const progress = smoothstep(
      Math.min(1, Math.max(0, reduced ? 0 : (progressRef?.current ?? 0))),
    );

    // — Swap transition —
    const presenceTarget = requested.current === rendered ? 1 : 0;
    presence.current = damp(presence.current, presenceTarget, 7, delta);
    if (presenceTarget === 0 && presence.current < 0.05) {
      setRendered(requested.current);
    }
    const appear = presence.current;

    // — Pointer (damped, and completely off under reduced motion) —
    const px = reduced ? 0 : pointerState.x * pointerStrength;
    const py = reduced ? 0 : pointerState.y * pointerStrength;

    // — Scroll-driven keyframe blend —
    const { from, to } = pose;
    const mix = (a: number, b: number) => a + (b - a) * progress;

    const targetScale = mix(from.scale, to.scale) * (0.68 + 0.32 * appear);
    group.scale.setScalar(
      damp(group.scale.x, targetScale, 8, delta),
    );

    const idleY = reduced ? 0 : Math.sin(time * 0.75) * 0.035;
    group.position.y = damp(
      group.position.y,
      idleY + (1 - appear) * -0.45,
      8,
      delta,
    );

    const targetRotY =
      mix(from.rotationY, to.rotationY) +
      (reduced ? 0 : time * spin) +
      px * 0.28 +
      (1 - appear) * 0.8;
    group.rotation.y = damp(group.rotation.y, targetRotY, 5, delta);

    group.rotation.x = damp(
      group.rotation.x,
      reduced ? 0 : -py * 0.1 + Math.sin(time * 0.55) * 0.012,
      4,
      delta,
    );
    group.rotation.z = damp(
      group.rotation.z,
      reduced ? 0 : Math.sin(time * 0.42) * 0.02 + px * 0.02,
      4,
      delta,
    );

    // — Camera —
    const camX = mix(from.camera[0], to.camera[0]) + px * 0.45;
    const camY = mix(from.camera[1], to.camera[1]) + py * 0.3;
    const camZ = mix(from.camera[2], to.camera[2]);

    camera.position.set(
      damp(camera.position.x, camX, 4.5, delta),
      damp(camera.position.y, camY, 4.5, delta),
      damp(camera.position.z, camZ, 4.5, delta),
    );

    lookAt.current.set(
      damp(lookAt.current.x, mix(from.target[0], to.target[0]), 4.5, delta),
      damp(lookAt.current.y, mix(from.target[1], to.target[1]), 4.5, delta),
      damp(lookAt.current.z, mix(from.target[2], to.target[2]), 4.5, delta),
    );
    camera.lookAt(lookAt.current);
  });

  const Model = dishModels[rendered];

  return (
    <>
      <group ref={groupRef} scale={pose.from.scale}>
        <Model palette={palette} quality={quality} />
      </group>

      {shadows ? (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.8}
          scale={10}
          blur={2.8}
          far={5}
          color="#000000"
          resolution={quality === "full" ? 512 : 256}
          frames={quality === "full" ? Infinity : 1}
        />
      ) : null}
    </>
  );
}
