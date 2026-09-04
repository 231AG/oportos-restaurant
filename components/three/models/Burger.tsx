"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { displace, seeded } from "../utils/geometry";
import { createFoodMaterial, createSimpleMaterial } from "../utils/materials";
import { useAssets } from "../utils/useAssets";
import { Plate } from "./Plate";
import type { DishModelProps } from "../types";

/**
 * Double patty stack. The two patties use the grill-stripe branch of the food
 * shader at different frequencies and axes so the sear marks don't line up, and
 * the sesame seeds are one instanced mesh rather than 40 draw calls.
 */
export function Burger({ palette, quality }: DishModelProps) {
  const full = quality === "full";
  const seedsRef = useRef<THREE.InstancedMesh>(null);
  const seedCount = full ? 42 : 18;

  const assets = useAssets(() => {
    const bunTop = displace(
      new THREE.SphereGeometry(
        0.92,
        full ? 48 : 24,
        full ? 30 : 16,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.56,
      ),
      0.03,
      3.4,
      2,
    );

    const bunBase = displace(
      new THREE.CylinderGeometry(0.9, 0.82, 0.32, full ? 48 : 24, 2),
      0.025,
      4,
      2,
    );

    const patty = displace(
      new THREE.CylinderGeometry(0.88, 0.9, 0.26, full ? 44 : 22, 2),
      0.035,
      5.5,
      full ? 3 : 2,
    );

    const lettuce = displace(
      new THREE.TorusGeometry(0.84, 0.1, full ? 10 : 6, full ? 44 : 22),
      0.09,
      7,
      2,
    );

    const meat = (frequency: number, axis: "x" | "z") =>
      createFoodMaterial({
        base: "#5e2b12",
        deep: palette.deep,
        glow: palette.glow,
        noiseScale: 8,
        char: 0.72,
        glaze: 0.3,
        stripes: 0.8,
        stripeFrequency: frequency,
        stripeAxis: axis,
        roughness: 0.55,
        clearcoat: 0.25,
        cheap: !full,
      }).material;

    return {
      bunTop,
      bunBase,
      patty,
      lettuce,
      tomato: new THREE.CylinderGeometry(0.6, 0.6, 0.1, full ? 32 : 16),
      cheese: new THREE.BoxGeometry(1.52, 0.05, 1.52),
      cheeseDrip: new THREE.BoxGeometry(0.34, 0.16, 0.06),
      seed: new THREE.SphereGeometry(0.028, 6, 5),
      // The bun is the only warm-neutral in the stack — keeping it on the dish
      // accent turned the whole burger into one orange mass.
      bun: createFoodMaterial({
        base: "#b8823f",
        deep: "#4a2a10",
        glow: "#ffd9a3",
        noiseScale: 5.5,
        char: 0.34,
        glaze: 0.18,
        roughness: 0.78,
        clearcoat: 0.06,
        cheap: !full,
      }).material,
      pattyTop: meat(11, "x"),
      pattyBottom: meat(9, "z"),
      cheeseMaterial: createSimpleMaterial("#e8912a", 0.35, 0.5),
      lettuceMaterial: createSimpleMaterial("#3f6b1f", 0.75, 0.25),
      tomatoMaterial: createSimpleMaterial("#a11d15", 0.4, 0.6),
      seedMaterial: createSimpleMaterial("#f0d9a8", 0.6, 0.1),
      seedPlacements: (() => {
        const rand = seeded(4417);
        return Array.from({ length: seedCount }, () => {
          const theta = rand() * Math.PI * 2;
          const phi = rand() * Math.PI * 0.42;
          return new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * 0.93,
            Math.cos(phi) * 0.93,
            Math.sin(phi) * Math.sin(theta) * 0.93,
          );
        });
      })(),
    };
  }, [palette.base, palette.deep, palette.glow, full, seedCount]);

  useLayoutEffect(() => {
    const mesh = seedsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    assets.seedPlacements.forEach((position, index) => {
      // Seeds sit on the top bun's actual surface: the dome is scaled to 0.78
      // on Y and centred at 1.06, so the placement has to follow it or the
      // seeds float in a ring above the burger.
      dummy.position.copy(position);
      dummy.position.y = position.y * 0.78 + 1.06;
      dummy.scale.setScalar(0.85 + (index % 5) * 0.08);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [assets.seedPlacements]);

  const castShadow = full;

  return (
    <group position={[0, 0, 0]}>
      <Plate quality={quality} radius={1.75} />

      <mesh
        geometry={assets.bunBase}
        material={assets.bun}
        position={[0, 0.2, 0]}
        castShadow={castShadow}
      />
      <mesh
        geometry={assets.patty}
        material={assets.pattyBottom}
        position={[0, 0.46, 0]}
        rotation={[0, 0.4, 0.015]}
        castShadow={castShadow}
      />

      {/* Cheese slice, rotated off-square with two drips over the edge. */}
      <group position={[0, 0.62, 0]} rotation={[0, 0.62, 0.02]}>
        <mesh geometry={assets.cheese} material={assets.cheeseMaterial} />
        <mesh
          geometry={assets.cheeseDrip}
          material={assets.cheeseMaterial}
          position={[0.74, -0.07, 0.28]}
          rotation={[0, Math.PI / 2, 0.25]}
        />
        <mesh
          geometry={assets.cheeseDrip}
          material={assets.cheeseMaterial}
          position={[-0.7, -0.09, -0.34]}
          rotation={[0, Math.PI / 2, -0.2]}
        />
      </group>

      <mesh
        geometry={assets.patty}
        material={assets.pattyTop}
        position={[0, 0.78, 0]}
        rotation={[0.01, -0.3, -0.02]}
        castShadow={castShadow}
      />
      <mesh
        geometry={assets.tomato}
        material={assets.tomatoMaterial}
        position={[0.04, 0.94, 0]}
      />
      <mesh
        geometry={assets.lettuce}
        material={assets.lettuceMaterial}
        position={[0, 1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.6]}
      />
      <mesh
        geometry={assets.bunTop}
        material={assets.bun}
        position={[0, 1.06, 0]}
        scale={[1, 0.78, 1]}
        castShadow={castShadow}
      />

      <instancedMesh
        ref={seedsRef}
        args={[assets.seed, assets.seedMaterial, seedCount]}
        frustumCulled={false}
      />
    </group>
  );
}
