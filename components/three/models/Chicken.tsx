"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { displace, seeded } from "../utils/geometry";
import {
  createFoodMaterial,
  createSimpleMaterial,
} from "../utils/materials";
import { useDispose } from "../utils/useAssets";
import { Plate } from "./Plate";
import type { DishModelProps } from "../types";

/**
 * Flame-grilled butterflied chicken.
 *
 * Built from displaced primitives rather than a downloaded model: a lumpy
 * ellipsoid body, two capsule legs with exposed bone tips, folded wings, plus
 * charred lemon and herbs for scale and colour contrast. The skin material
 * carries the fbm char shader with grill stripes along the plate's X axis.
 */
export function Chicken({ palette, quality }: DishModelProps) {
  const full = quality === "full";

  const assets = useMemo(() => {
    const rand = seeded(9021);

    const body = displace(
      new THREE.SphereGeometry(0.62, full ? 64 : 28, full ? 44 : 20),
      full ? 0.075 : 0.055,
      4.6,
      full ? 4 : 2,
    );

    const leg = displace(
      new THREE.CapsuleGeometry(0.17, 0.3, 4, full ? 24 : 12),
      0.035,
      5.5,
      2,
    );

    const wing = displace(
      new THREE.SphereGeometry(0.3, full ? 28 : 14, full ? 20 : 10),
      0.045,
      5,
      2,
    );

    const bone = new THREE.CylinderGeometry(0.052, 0.062, 0.2, 10);
    const lemon = new THREE.CylinderGeometry(0.24, 0.22, 0.14, full ? 28 : 14);
    const herb = new THREE.IcosahedronGeometry(0.07, 0);

    const skin = createFoodMaterial({
      base: palette.base,
      deep: palette.deep,
      glow: palette.glow,
      noiseScale: 5.4,
      char: 0.88,
      glaze: 0.2,
      stripes: 0.5,
      stripeFrequency: 13,
      roughness: 0.62,
      clearcoat: 0.24,
      cheap: !full,
    });

    const legSkin = createFoodMaterial({
      base: palette.base,
      deep: palette.deep,
      glow: palette.glow,
      noiseScale: 8.5,
      char: 0.9,
      glaze: 0.24,
      stripes: 0.28,
      stripeFrequency: 16,
      stripeAxis: "z",
      roughness: 0.58,
      clearcoat: 0.28,
      cheap: !full,
    });

    const lemonSkin = createFoodMaterial({
      base: "#d9a52b",
      deep: "#3a2405",
      glow: "#ffd76b",
      noiseScale: 9,
      char: 0.75,
      glaze: 0.25,
      roughness: 0.55,
      clearcoat: 0.2,
      cheap: !full,
    });

    return {
      body,
      leg,
      wing,
      bone,
      lemon,
      herb,
      skin: skin.material,
      legSkin: legSkin.material,
      lemonSkin: lemonSkin.material,
      boneMaterial: createSimpleMaterial("#e8dcc6", 0.65, 0.1),
      herbMaterial: createSimpleMaterial("#2f4a1c", 0.8, 0.15),
      herbPositions: Array.from({ length: full ? 7 : 4 }, () => {
        const angle = rand() * Math.PI * 2;
        const radius = 0.72 + rand() * 0.42;
        return [
          Math.cos(angle) * radius,
          0.06 + rand() * 0.03,
          Math.sin(angle) * radius,
        ] as [number, number, number];
      }),
    };
  }, [palette.base, palette.deep, palette.glow, full]);

  useDispose(assets);

  const castShadow = full;

  return (
    <group>
      {/* No jus disc here: at this camera height its specular caught the key
          light as a bright arc across the front of the plate that read as a
          light leak rather than as sauce. */}
      <Plate quality={quality} />

      {/* Two breast lobes with a seam between them — a butterflied bird is not
          one mass, and modelling it as a single sphere is what made the first
          pass read as a ball. */}
      {[-1, 1].map((side) => (
        <mesh
          key={`lobe-${side}`}
          geometry={assets.body}
          material={assets.skin}
          position={[side * 0.44, 0.33, side * 0.03]}
          rotation={[0.04, side * 0.16, side * -0.2]}
          scale={[0.9, 0.5, 1.04]}
          castShadow={castShadow}
        />
      ))}

      {/* Neck end, tapering away from the camera. */}
      <mesh
        geometry={assets.body}
        material={assets.skin}
        position={[0, 0.26, -0.72]}
        rotation={[0.34, 0, 0]}
        scale={[0.6, 0.34, 0.5]}
        castShadow={castShadow}
      />

      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <mesh
            geometry={assets.leg}
            material={assets.legSkin}
            position={[side * 0.48, 0.24, 0.62]}
            rotation={[1.2, 0, side * 0.5]}
            scale={[1.25, 1.2, 1.25]}
            castShadow={castShadow}
          />
          <mesh
            geometry={assets.bone}
            material={assets.boneMaterial}
            position={[side * 0.7, 0.11, 0.96]}
            rotation={[1.2, 0, side * 0.5]}
            scale={1.2}
            castShadow={castShadow}
          />
        </group>
      ))}

      {[-1, 1].map((side) => (
        <mesh
          key={`wing-${side}`}
          geometry={assets.wing}
          material={assets.legSkin}
          position={[side * 0.78, 0.28, -0.24]}
          rotation={[0.2, side * 0.5, side * -0.35]}
          scale={[0.95, 0.32, 0.7]}
          castShadow={castShadow}
        />
      ))}

      {/* Charred lemon halves. */}
      <mesh
        geometry={assets.lemon}
        material={assets.lemonSkin}
        position={[0.92, 0.11, 0.42]}
        rotation={[0, 0, 0.12]}
        castShadow={castShadow}
      />
      <mesh
        geometry={assets.lemon}
        material={assets.lemonSkin}
        position={[-0.88, 0.1, -0.5]}
        rotation={[0.08, 0.4, -0.16]}
        scale={0.86}
        castShadow={castShadow}
      />

      {assets.herbPositions.map((position, index) => (
        <mesh
          key={`herb-${index}`}
          geometry={assets.herb}
          material={assets.herbMaterial}
          position={position}
          rotation={[index, index * 1.7, index * 0.6]}
          scale={[1, 0.35, 1]}
        />
      ))}
    </group>
  );
}
