import * as THREE from "three";

/**
 * Procedural food materials.
 *
 * There are no texture files in this project (see PROGRESS.md — no network
 * access to source photography or GLBs), so surface detail is generated in the
 * shader: 3D fbm value noise drives char patches, glaze highlights and
 * roughness break-up, and an optional stripe term burns grill marks into the
 * surface in object space.
 *
 * Rather than writing a lighting model from scratch, the standard
 * `MeshPhysicalMaterial` is patched via `onBeforeCompile`, so the food still
 * gets three.js PBR, IBL from the scene environment, and shadows for free.
 */

export interface FoodMaterialOptions {
  /** Base cooked colour. */
  base: string;
  /** Char / shadow colour. */
  deep: string;
  /** Glaze highlight colour, usually the dish's ember tone. */
  glow: string;
  /** Size of the noise features, in object units. */
  noiseScale?: number;
  /** 0–1. How much of the surface goes dark. */
  char?: number;
  /** 0–1. Wet, lacquered look. */
  glaze?: number;
  /** 0–1. Strength of grill marks (0 disables the branch entirely). */
  stripes?: number;
  stripeFrequency?: number;
  /** Grill-mark axis in object space. */
  stripeAxis?: "x" | "z";
  roughness?: number;
  clearcoat?: number;
  metalness?: number;
  /** Low-cost mode: fewer fbm octaves. */
  cheap?: boolean;
}

const NOISE_GLSL = /* glsl */ `
  varying vec3 vFoodPos;
  uniform vec3 uBase;
  uniform vec3 uDeep;
  uniform vec3 uGlow;
  uniform float uNoiseScale;
  uniform float uChar;
  uniform float uGlaze;
  uniform float uStripes;
  uniform float uStripeFreq;
  uniform float uWarm;

  float foodHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float foodNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(foodHash(i + vec3(0, 0, 0)), foodHash(i + vec3(1, 0, 0)), f.x),
          mix(foodHash(i + vec3(0, 1, 0)), foodHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(foodHash(i + vec3(0, 0, 1)), foodHash(i + vec3(1, 0, 1)), f.x),
          mix(foodHash(i + vec3(0, 1, 1)), foodHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float foodFbm(vec3 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      total += foodNoise(p) * amp;
      p *= 2.03;
      amp *= 0.5;
    }
    return total;
  }
`;

export function createFoodMaterial(options: FoodMaterialOptions) {
  const {
    base,
    deep,
    glow,
    noiseScale = 3.2,
    char = 0.45,
    glaze = 0.35,
    stripes = 0,
    stripeFrequency = 9,
    stripeAxis = "x",
    roughness = 0.5,
    clearcoat = 0.35,
    metalness = 0,
    cheap = false,
  } = options;

  const uniforms = {
    uBase: { value: new THREE.Color(base) },
    uDeep: { value: new THREE.Color(deep) },
    uGlow: { value: new THREE.Color(glow) },
    uNoiseScale: { value: noiseScale },
    uChar: { value: char },
    uGlaze: { value: glaze },
    uStripes: { value: stripes },
    uStripeFreq: { value: stripeFrequency },
    uWarm: { value: 1 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    // White base colour: the shader writes the diffuse colour itself.
    color: "#ffffff",
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness: 0.42,
    sheen: 0.25,
    sheenColor: new THREE.Color(glow),
  });

  const octaves = cheap ? 2 : 4;
  const axis = stripeAxis === "x" ? "vFoodPos.x" : "vFoodPos.z";

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n varying vec3 vFoodPos;`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n vFoodPos = position;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\n#define OCTAVES ${octaves}\n${NOISE_GLSL}`,
      )
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        float fNoise = foodFbm(vFoodPos * uNoiseScale);
        // Second, tighter octave set: crisped skin speckle on top of the
        // large-scale colour variation.
        float fSpeckle = foodNoise(vFoodPos * uNoiseScale * 5.5);

        float charAmt = smoothstep(0.40, 0.70, fNoise) * uChar;
        charAmt = max(charAmt, smoothstep(0.72, 0.95, fSpeckle) * uChar * 0.75);
        vec3 foodColor = mix(uBase, uDeep, charAmt);

        // Glaze catches the light on the raised, low-noise areas.
        float sheenAmt = smoothstep(0.34, 0.08, fNoise) * uGlaze;
        foodColor = mix(foodColor, uGlow, sheenAmt);

        // Grill marks, burnt into object space so they stay put as it rotates.
        float stripeMask = 0.0;
        if (uStripes > 0.001) {
          float band = abs(sin(${axis} * uStripeFreq + fNoise * 1.2));
          stripeMask = (1.0 - smoothstep(0.04, 0.22, band)) * uStripes;
          foodColor = mix(foodColor, uDeep * 0.30, stripeMask);
        }

        // Broad light/shade variation across the surface — a uniform diffuse is
        // what makes procedural food read as plastic.
        foodColor *= 0.74 + fNoise * 0.62;
        foodColor *= 0.94 + fSpeckle * 0.14;
        diffuseColor.rgb *= foodColor;
      `,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(
          roughnessFactor - sheenAmt * 0.42 + charAmt * 0.30 + stripeMask * 0.25,
          0.05,
          1.0
        );
      `,
      );
  };

  // Distinct cache key per configuration, otherwise three reuses one program
  // across materials whose injected constants differ.
  material.customProgramCacheKey = () =>
    `food-${octaves}-${axis}-${stripes > 0 ? 1 : 0}`;

  return { material, uniforms };
}

/** Glazed ceramic used for plates and bowls — dark, subtly reflective. */
export function createCeramicMaterial(tint = "#171310") {
  // Matte-glazed, not wet: a high-clearcoat plate under a hard key light blows
  // out into two white hotspots and reads as plastic.
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.6,
    envMapIntensity: 0.55,
  });
}

export function createSimpleMaterial(
  color: string,
  roughness = 0.55,
  clearcoat = 0.2,
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    clearcoat,
    clearcoatRoughness: 0.4,
  });
}

export function disposeMaterials(...materials: THREE.Material[]) {
  materials.forEach((material) => material.dispose());
}
