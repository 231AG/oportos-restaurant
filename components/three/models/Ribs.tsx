"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { displace, seeded } from "../utils/geometry";
import { createFoodMaterial, createSimpleMaterial } from "../utils/materials";
import { useDispose } from "../utils/useAssets";
import { Plate } from "./Plate";
import type { DishModelProps } from "../types";

/**
 * Half rack, fanned across the plate. Each rib is the same displaced slab
 * geometry placed with a per-index offset and rotation from a seeded PRNG, so
 * the rack reads as hand-cut but renders identically on every load.
 */
export function Ribs({ palette, quality }: DishModelProps) {
  const full = quality === "full";

  const assets = useMemo(() => {
    const rand = seeded(2211);

    const slab = displace(
      new THREE.BoxGeometry(1.55, 0.26, 0.36, full ? 24 : 10, 4, 6),
      0.045,
      4.2,
      full ? 3 : 2,
    );

    const ribs = Array.from({ length: full ? 5 : 4 }, (_, index) => ({
      position: [
        (rand() - 0.5) * 0.16,
        0.19 + index * 0.012,
        -0.72 + index * 0.36,
      ] as [number, number, number],
      rotation: [
        (rand() - 0.5) * 0.06,
        (rand() - 0.5) * 0.12,
        (rand() - 0.5) * 0.05,
      ] as [number, number, number],
    }));

    return {
      slab,
      bone: new THREE.CylinderGeometry(0.06, 0.055, 0.42, 10),
      seed: new THREE.SphereGeometry(0.026, 5, 4),
      wedge: new THREE.CylinderGeometry(
        0.3,
        0.3,
        0.12,
        full ? 24 : 12,
        1,
        false,
        0,
        Math.PI,
      ),
      glaze: createFoodMaterial({
        base: palette.base,
        deep: palette.deep,
        glow: palette.glow,
        noiseScale: 6.5,
        char: 0.66,
        glaze: 0.62,
        stripes: 0.35,
        stripeFrequency: 5,
        roughness: 0.28,
        clearcoat: 0.85,
        cheap: !full,
      }).material,
      boneMaterial: createSimpleMaterial("#e6dac4", 0.6, 0.1),
      wedgeMaterial: createFoodMaterial({
        base: "#c8681a",
        deep: "#2a1205",
        glow: "#ffb15c",
        noiseScale: 10,
        char: 0.8,
        glaze: 0.2,
        roughness: 0.6,
        cheap: !full,
      }).material,
      seedMaterial: createSimpleMaterial("#efdcb2", 0.55, 0.1),
      ribs,
    };
  }, [palette.base, palette.deep, palette.glow, full]);

  useDispose(assets);

  const castShadow = full;

  return (
    <group>
      <Plate quality={quality} jus={palette.deep} jusRadius={1.35} />

      {assets.ribs.map((rib, index) => (
        <group key={`rib-${index}`} position={rib.position} rotation={rib.rotation}>
          <mesh
            geometry={assets.slab}
            material={assets.glaze}
            castShadow={castShadow}
          />
          <mesh
            geometry={assets.bone}
            material={assets.boneMaterial}
            position={[-0.92, -0.01, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow={castShadow}
          />
        </group>
      ))}

      <mesh
        geometry={assets.wedge}
        material={assets.wedgeMaterial}
        position={[1.15, 0.09, 0.72]}
        rotation={[0, -0.5, 0.08]}
      />

      {Array.from({ length: full ? 16 : 8 }, (_, index) => {
        const rand = seeded(700 + index)();
        return (
          <mesh
            key={`sesame-${index}`}
            geometry={assets.seed}
            material={assets.seedMaterial}
            position={[
              (rand - 0.5) * 1.9,
              0.33 + (index % 3) * 0.02,
              -0.8 + (index % 6) * 0.3,
            ]}
          />
        );
      })}
    </group>
  );
}
