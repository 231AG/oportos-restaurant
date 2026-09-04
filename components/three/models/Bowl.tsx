"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { bowlGeometry, displace, seeded } from "../utils/geometry";
import {
  createCeramicMaterial,
  createFoodMaterial,
  createSimpleMaterial,
} from "../utils/materials";
import { useAssets } from "../utils/useAssets";
import type { DishModelProps } from "../types";

/**
 * Grain bowl. The grain bed is a single instanced mesh (~180 instances at full
 * quality, 70 reduced) scattered on a disc with a slight dome, which is far
 * cheaper than modelling a filled bowl and reads correctly at hero scale.
 */
export function Bowl({ palette, quality }: DishModelProps) {
  const full = quality === "full";
  const grainsRef = useRef<THREE.InstancedMesh>(null);
  const grainCount = full ? 180 : 70;

  const assets = useAssets(() => {
    const cabbage = displace(
      new THREE.BoxGeometry(0.78, 0.42, 0.5, 10, 6, 8),
      0.06,
      5,
      full ? 3 : 2,
    );

    return {
      bowl: bowlGeometry(1.32, full ? 80 : 40),
      cabbage,
      grain: new THREE.SphereGeometry(0.05, 5, 4),
      pepper: displace(
        new THREE.SphereGeometry(0.19, full ? 20 : 10, full ? 14 : 8),
        0.05,
        6,
        2,
      ),
      feta: new THREE.BoxGeometry(0.16, 0.14, 0.15),
      seedDisc: new THREE.CircleGeometry(1.06, full ? 48 : 24),
      bowlMaterial: createCeramicMaterial("#181310"),
      grainMaterial: createSimpleMaterial(palette.base, 0.7, 0.15),
      bedMaterial: createSimpleMaterial("#6f5417", 0.85, 0.05),
      cabbageMaterial: createFoodMaterial({
        base: "#5f6b2a",
        deep: palette.deep,
        glow: palette.glow,
        noiseScale: 7,
        char: 0.78,
        glaze: 0.28,
        stripes: 0.3,
        stripeFrequency: 12,
        roughness: 0.6,
        cheap: !full,
      }).material,
      pepperMaterial: createFoodMaterial({
        base: "#9c1f10",
        deep: "#240703",
        glow: "#ff7a3c",
        noiseScale: 9,
        char: 0.6,
        glaze: 0.65,
        roughness: 0.3,
        clearcoat: 0.7,
        cheap: !full,
      }).material,
      fetaMaterial: createSimpleMaterial("#f2ece0", 0.8, 0.05),
      grainPlacements: (() => {
        const rand = seeded(8855);
        return Array.from({ length: grainCount }, () => {
          const angle = rand() * Math.PI * 2;
          const radius = Math.sqrt(rand()) * 1.02;
          return {
            position: new THREE.Vector3(
              Math.cos(angle) * radius,
              0.66 + Math.cos((radius / 1.1) * Math.PI * 0.5) * 0.08 + rand() * 0.03,
              Math.sin(angle) * radius,
            ),
            scale: 0.7 + rand() * 0.7,
            rotation: rand() * Math.PI,
          };
        });
      })(),
    };
  }, [palette.base, palette.deep, palette.glow, full, grainCount]);

  useLayoutEffect(() => {
    const mesh = grainsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    assets.grainPlacements.forEach((grain, index) => {
      dummy.position.copy(grain.position);
      dummy.rotation.set(grain.rotation, grain.rotation * 1.4, 0);
      dummy.scale.set(grain.scale, grain.scale * 0.6, grain.scale * 1.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [assets.grainPlacements]);

  const castShadow = full;

  return (
    <group>
      <mesh
        geometry={assets.bowl}
        material={assets.bowlMaterial}
        receiveShadow={castShadow}
      />

      {/* Bed under the instanced grains so no gaps show through. */}
      <mesh
        geometry={assets.seedDisc}
        material={assets.bedMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.63, 0]}
      />

      <instancedMesh
        ref={grainsRef}
        args={[assets.grain, assets.grainMaterial, grainCount]}
        frustumCulled={false}
      />

      <mesh
        geometry={assets.cabbage}
        material={assets.cabbageMaterial}
        position={[-0.3, 0.86, 0.16]}
        rotation={[0.12, 0.55, 0.24]}
        castShadow={castShadow}
      />
      <mesh
        geometry={assets.cabbage}
        material={assets.cabbageMaterial}
        position={[0.34, 0.82, -0.24]}
        rotation={[-0.1, -0.4, -0.18]}
        scale={0.82}
        castShadow={castShadow}
      />

      {[
        [0.52, 0.78, 0.42],
        [-0.58, 0.76, -0.4],
        [0.06, 0.8, 0.66],
      ].map((position, index) => (
        <mesh
          key={`pepper-${index}`}
          geometry={assets.pepper}
          material={assets.pepperMaterial}
          position={position as [number, number, number]}
          rotation={[index, index * 1.3, 0]}
          scale={[1, 0.7, 1.25]}
        />
      ))}

      {[
        [-0.12, 0.8, -0.55],
        [0.66, 0.79, -0.02],
        [-0.66, 0.79, 0.3],
        [0.2, 0.82, 0.3],
      ].map((position, index) => (
        <mesh
          key={`feta-${index}`}
          geometry={assets.feta}
          material={assets.fetaMaterial}
          position={position as [number, number, number]}
          rotation={[index * 0.4, index * 0.9, index * 0.3]}
        />
      ))}
    </group>
  );
}
