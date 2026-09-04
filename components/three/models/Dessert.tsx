"use client";

import * as THREE from "three";
import { displace } from "../utils/geometry";
import { createFoodMaterial, createSimpleMaterial } from "../utils/materials";
import { useAssets } from "../utils/useAssets";
import { Plate } from "./Plate";
import type { DishModelProps } from "../types";

/**
 * Burnt Basque cheesecake with a slice pulled away.
 *
 * The scorched top is a separate capped disc rather than a shader gradient —
 * the burn on a Basque cheesecake stops abruptly at the rim, and faking that
 * with height-based mixing looked like a sunset instead of a bake.
 */
export function Dessert({ palette, quality }: DishModelProps) {
  const full = quality === "full";

  const assets = useAssets(() => {
    const segments = full ? 64 : 28;
    const gap = 0.72;

    const body = displace(
      new THREE.CylinderGeometry(
        1.02,
        0.9,
        0.62,
        segments,
        3,
        false,
        gap,
        Math.PI * 2 - gap,
      ),
      0.035,
      4,
      full ? 3 : 2,
    );

    const slice = displace(
      new THREE.CylinderGeometry(1.02, 0.9, 0.62, 16, 3, false, 0, gap),
      0.035,
      4,
      2,
    );

    return {
      body,
      slice,
      top: new THREE.CircleGeometry(1.02, segments, gap, Math.PI * 2 - gap),
      sliceTop: new THREE.CircleGeometry(1.02, 16, 0, gap),
      honey: new THREE.CircleGeometry(0.46, segments),
      cream: new THREE.SphereGeometry(0.26, full ? 24 : 12, full ? 18 : 9),
      crust: createFoodMaterial({
        base: "#8a5a25",
        deep: "#2c1806",
        glow: palette.glow,
        noiseScale: 5,
        char: 0.6,
        glaze: 0.3,
        roughness: 0.62,
        clearcoat: 0.2,
        cheap: !full,
      }).material,
      // A Basque cheesecake's top is genuinely burnt — near-black at the centre,
      // amber only where the surface cracked.
      burntTop: createFoodMaterial({
        base: "#39200a",
        deep: "#0d0703",
        glow: "#a8641f",
        noiseScale: 6.5,
        char: 0.95,
        glaze: 0.14,
        roughness: 0.55,
        clearcoat: 0.25,
        cheap: !full,
      }).material,
      innerMaterial: createSimpleMaterial("#f0dcb0", 0.75, 0.1),
      honeyMaterial: new THREE.MeshPhysicalMaterial({
        color: "#c8871f",
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.9,
      }),
      creamMaterial: createSimpleMaterial("#f7f1e6", 0.85, 0.05),
    };
  }, [palette.base, palette.deep, palette.glow, full]);

  const castShadow = full;

  return (
    <group>
      <Plate quality={quality} radius={1.62} />

      <group position={[-0.16, 0.36, 0]}>
        <mesh
          geometry={assets.body}
          material={assets.crust}
          castShadow={castShadow}
        />
        <mesh
          geometry={assets.top}
          material={assets.burntTop}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.315, 0]}
        />
      </group>

      {/* The cut slice, pulled clear of the cake and turned away from it. */}
      <group position={[1.22, 0.34, 0.66]} rotation={[0, -1.9, 0.05]}>
        <mesh
          geometry={assets.slice}
          material={assets.crust}
          castShadow={castShadow}
        />
        <mesh
          geometry={assets.sliceTop}
          material={assets.burntTop}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.315, 0]}
        />
      </group>

      <mesh
        geometry={assets.honey}
        material={assets.honeyMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.9, 0.045, 0.95]}
        scale={[1, 0.72, 1]}
      />
      <mesh
        geometry={assets.cream}
        material={assets.creamMaterial}
        position={[-0.92, 0.2, 0.95]}
        scale={[1.35, 0.85, 1]}
        rotation={[0, 0.4, 0.2]}
        castShadow={castShadow}
      />
    </group>
  );
}
