import * as THREE from "three";

/**
 * CPU-side geometry helpers.
 *
 * Food is never a primitive: everything gets displaced by value noise before
 * normals are recomputed, which is what stops the models reading as "spheres
 * with a nice material on them".
 */

const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** 3D value noise, 0…1. Matches the shader's noise closely enough to blend. */
export function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const c = (dx: number, dy: number, dz: number) =>
    hash3(ix + dx, iy + dy, iz + dz);

  return lerp(
    lerp(
      lerp(c(0, 0, 0), c(1, 0, 0), fx),
      lerp(c(0, 1, 0), c(1, 1, 0), fx),
      fy,
    ),
    lerp(
      lerp(c(0, 0, 1), c(1, 0, 1), fx),
      lerp(c(0, 1, 1), c(1, 1, 1), fx),
      fy,
    ),
    fz,
  );
}

export function fbm3(x: number, y: number, z: number, octaves = 3): number {
  let total = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    total += noise3(x * freq, y * freq, z * freq) * amp;
    freq *= 2.02;
    amp *= 0.5;
  }
  return total;
}

/**
 * Pushes every vertex along its normal by an fbm field.
 * `amount` is in object units; `scale` sets the lump size.
 */
export function displace(
  geometry: THREE.BufferGeometry,
  amount = 0.06,
  scale = 2.4,
  octaves = 3,
): THREE.BufferGeometry {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    const d = (fbm3(v.x * scale, v.y * scale, v.z * scale, octaves) - 0.5) * 2;
    position.setXYZ(
      i,
      v.x + n.x * d * amount,
      v.y + n.y * d * amount,
      v.z + n.z * d * amount,
    );
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/** A shallow, wide restaurant plate with a rolled rim. */
export function plateGeometry(radius = 1.9, segments = 96) {
  const points: THREE.Vector2[] = [];
  const steps = 22;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Flat well, then a lifted rim that rolls back down to a thin edge.
    const r = t * radius;
    const well = Math.pow(t, 3.4) * 0.16;
    const rim = t > 0.82 ? Math.pow((t - 0.82) / 0.18, 1.6) * 0.1 : 0;
    points.push(new THREE.Vector2(Math.max(0.001, r), well + rim));
  }
  // Return under the rim so the plate has thickness from grazing angles.
  points.push(new THREE.Vector2(radius * 0.995, 0.2));
  points.push(new THREE.Vector2(radius * 0.6, 0.12));
  points.push(new THREE.Vector2(0.001, 0.1));

  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/** Deeper vessel for the grain bowl. */
export function bowlGeometry(radius = 1.3, segments = 72) {
  const points: THREE.Vector2[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(
      new THREE.Vector2(
        Math.max(0.001, Math.sin(t * Math.PI * 0.52) * radius),
        Math.pow(t, 1.7) * 0.9,
      ),
    );
  }
  points.push(new THREE.Vector2(radius * 0.94, 0.94));
  points.push(new THREE.Vector2(radius * 0.5, 0.16));
  points.push(new THREE.Vector2(0.001, 0.12));

  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/** Deterministic pseudo-random sequence so scenes are identical each load. */
export function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function disposeGeometries(...geometries: THREE.BufferGeometry[]) {
  geometries.forEach((geometry) => geometry.dispose());
}
