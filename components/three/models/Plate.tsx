"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { plateGeometry } from "../utils/geometry";
import { createCeramicMaterial } from "../utils/materials";
import type { Quality } from "../types";

interface PlateProps {
  quality: Quality;
  radius?: number;
  /** Warm pool of glaze / jus sitting in the well of the plate. */
  jus?: string;
  jusRadius?: number;
}

export function Plate({
  quality,
  radius = 1.34,
  jus,
  jusRadius = 0.9,
}: PlateProps) {
  const { geometry, material, jusGeometry, jusMaterial } = useMemo(() => {
    const segments = quality === "full" ? 96 : 48;
    return {
      geometry: plateGeometry(radius, segments),
      material: createCeramicMaterial("#0f0c0a"),
      jusGeometry: new THREE.CircleGeometry(jusRadius, segments),
      jusMaterial: new THREE.MeshPhysicalMaterial({
        color: jus ?? "#3a0f06",
        roughness: 0.34,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.9,
      }),
    };
  }, [quality, radius, jus, jusRadius]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      jusGeometry.dispose();
      jusMaterial.dispose();
    },
    [geometry, material, jusGeometry, jusMaterial],
  );

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        receiveShadow={quality === "full"}
      />
      {jus ? (
        <mesh
          geometry={jusGeometry}
          material={jusMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.035, 0]}
        />
      ) : null}
    </group>
  );
}
