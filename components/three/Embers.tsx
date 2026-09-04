"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seeded } from "./utils/geometry";

interface EmbersProps {
  count?: number;
  color?: string;
  /** Set false under reduced motion — the points stay, the drift stops. */
  animate?: boolean;
  radius?: number;
  height?: number;
}

/**
 * Slow-rising sparks from the grill. One draw call, one buffer, animated
 * entirely in the vertex shader from a time uniform — the CPU never touches the
 * positions, and the whole effect costs a single uniform write per frame.
 */
export function Embers({
  count = 70,
  color = "#ff7a2f",
  animate = true,
  radius = 3.4,
  height = 5,
}: EmbersProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const rand = seeded(1337);
    const positions = new Float32Array(count * 3);
    const attributes = new Float32Array(count * 3); // speed, phase, size

    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const distance = Math.sqrt(rand()) * radius;
      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = rand() * height;
      positions[i * 3 + 2] = Math.sin(angle) * distance - 1;

      attributes[i * 3] = 0.18 + rand() * 0.42;
      attributes[i * 3 + 1] = rand() * Math.PI * 2;
      attributes[i * 3 + 2] = 1.4 + rand() * 3.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aEmber", new THREE.BufferAttribute(attributes, 3));
    return geo;
  }, [count, radius, height]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: height },
      uColor: { value: new THREE.Color(color) },
      uPixelRatio: { value: 1 },
    }),
    [color, height],
  );

  // Written through the material ref rather than the memoised `uniforms` object:
  // the uniform values belong to three.js once the material is created, and
  // mutating a render-created object from the frame loop is not allowed.
  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!animate || !material) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute vec3 aEmber;
          uniform float uTime;
          uniform float uHeight;
          uniform float uPixelRatio;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            float speed = aEmber.x;
            float phase = aEmber.y;

            float rise = mod(pos.y + uTime * speed, uHeight);
            pos.y = rise;
            pos.x += sin(uTime * speed * 0.8 + phase) * 0.22;
            pos.z += cos(uTime * speed * 0.6 + phase) * 0.18;

            // Fade in off the coals, out near the top of the column.
            vAlpha = smoothstep(0.0, 0.8, rise) * (1.0 - smoothstep(uHeight * 0.45, uHeight, rise));

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aEmber.z * uPixelRatio * (10.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying float vAlpha;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float spark = smoothstep(0.5, 0.02, d);
            gl_FragColor = vec4(uColor, spark * vAlpha * 0.85);
            if (gl_FragColor.a < 0.01) discard;
          }
        `}
      />
    </points>
  );
}
