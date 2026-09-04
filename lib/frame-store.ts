/**
 * Mutable frame state shared between DOM and WebGL.
 *
 * Pointer position and page scroll are read every frame inside `useFrame`, so
 * they deliberately live outside React state — writing them to a store would
 * re-render the tree 60×/second for values only the render loop cares about.
 */

export interface PointerState {
  /** Target, normalised to −1…1 with (0,0) at viewport centre. */
  x: number;
  y: number;
  /** True once a real pointer (not touch) has moved — gates hover-only motion. */
  active: boolean;
}

export interface ScrollState {
  y: number;
  /** 0…1 over the whole document. */
  progress: number;
  /** px/frame, smoothed. Drives subtle scene "lag" on fast scrolls. */
  velocity: number;
}

export const pointerState: PointerState = { x: 0, y: 0, active: false };
export const scrollState: ScrollState = { y: 0, progress: 0, velocity: 0 };

let installed = 0;

/** Installs window listeners once, ref-counted so multiple mounts are safe. */
export function installFrameListeners(): () => void {
  installed += 1;
  if (installed > 1) return () => void (installed -= 1);

  let raf = 0;
  let lastY = window.scrollY;

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointerState.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerState.y = -((event.clientY / window.innerHeight) * 2 - 1);
    pointerState.active = true;
  };

  const onPointerLeave = () => {
    pointerState.x = 0;
    pointerState.y = 0;
    pointerState.active = false;
  };

  const measure = () => {
    const y = window.scrollY;
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    scrollState.velocity += ((y - lastY) - scrollState.velocity) * 0.2;
    scrollState.y = y;
    scrollState.progress = Math.min(1, Math.max(0, y / max));
    lastY = y;
    raf = requestAnimationFrame(measure);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  raf = requestAnimationFrame(measure);

  return () => {
    installed -= 1;
    if (installed > 0) return;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    cancelAnimationFrame(raf);
  };
}
