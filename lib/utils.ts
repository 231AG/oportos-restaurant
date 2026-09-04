/** Tiny classnames joiner — avoids pulling clsx/tailwind-merge for a project this size. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping — keeps easing consistent across refresh rates. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Maps `value` from [inMin, inMax] to [outMin, outMax], clamped. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
