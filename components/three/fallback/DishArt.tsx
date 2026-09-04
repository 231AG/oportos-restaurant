"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ModelKey, Palette } from "../types";

interface DishArtProps {
  model: ModelKey;
  palette: Palette;
  className?: string;
  label?: string;
}

/**
 * The no-WebGL / low-end fallback.
 *
 * Not a placeholder: a duotone print of the dish built from layered SVG
 * primitives on the dish's own palette, so a device without WebGL gets art
 * direction rather than an empty box. It parallaxes and breathes with the same
 * timing language as the 3D scene, and stops dead under reduced motion.
 */
export function DishArt({ model, palette, className, label }: DishArtProps) {
  const uid = useId().replace(/[:]/g, "");
  const reduced = useReducedMotion();

  const shapes = SHAPES[model];

  return (
    <motion.div
      className={cn("relative h-full w-full", className)}
      initial={reduced ? undefined : { opacity: 0, scale: 0.94 }}
      animate={reduced ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg
        viewBox="0 0 1000 1000"
        className="h-full w-full"
        role="img"
        aria-label={label ?? "Illustration of the dish"}
      >
        <defs>
          <radialGradient id={`${uid}-heat`} cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.55" />
            <stop offset="45%" stopColor={palette.base} stopOpacity="0.18" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-plate`} cx="46%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#241a15" />
            <stop offset="70%" stopColor="#120d0a" />
            <stop offset="100%" stopColor="#080605" />
          </radialGradient>

          <linearGradient id={`${uid}-food`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={palette.glow} />
            <stop offset="55%" stopColor={palette.base} />
            <stop offset="100%" stopColor={palette.deep} />
          </linearGradient>

          {/* Blur radii are in viewBox units, so they scale with the rendered
              size — 6 units looked fine in the editor and turned the dish into
              a smudge at hero scale. */}
          <filter id={`${uid}-soft`}>
            <feGaussianBlur stdDeviation="1.6" />
          </filter>

          <filter id={`${uid}-bigsoft`}>
            <feGaussianBlur stdDeviation="34" />
          </filter>

          <filter id={`${uid}-grain`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* Heat bloom */}
        <circle
          cx="500"
          cy="470"
          r="430"
          fill={`url(#${uid}-heat)`}
          filter={`url(#${uid}-bigsoft)`}
        />

        {/* Plate */}
        <ellipse
          cx="500"
          cy="540"
          rx="372"
          ry="352"
          fill={`url(#${uid}-plate)`}
        />
        <ellipse
          cx="500"
          cy="540"
          rx="372"
          ry="352"
          fill="none"
          stroke={palette.glow}
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />
        <ellipse
          cx="500"
          cy="540"
          rx="300"
          ry="284"
          fill="none"
          stroke="#f4ece0"
          strokeOpacity="0.06"
          strokeWidth="1"
        />

        {/* Dish silhouette */}
        <g filter={`url(#${uid}-soft)`} opacity="0.98">
          {shapes.map((shape, index) =>
            shape.type === "ellipse" ? (
              <ellipse
                key={index}
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                transform={
                  shape.rotate
                    ? `rotate(${shape.rotate} ${shape.cx} ${shape.cy})`
                    : undefined
                }
                fill={shape.fill ?? `url(#${uid}-food)`}
                opacity={shape.opacity ?? 1}
              />
            ) : (
              <path
                key={index}
                d={shape.d}
                fill={shape.fill ?? `url(#${uid}-food)`}
                opacity={shape.opacity ?? 1}
              />
            ),
          )}
        </g>

        {/* Char marks — the same language as the shader's grill stripes. */}
        <g
          stroke={palette.deep}
          strokeOpacity="0.55"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        >
          {MARKS[model].map((d, index) => (
            <path key={index} d={d} />
          ))}
        </g>

        {/* Rim light along the top-left of the composition */}
        <path
          d="M250 430 A 280 265 0 0 1 720 400"
          fill="none"
          stroke={palette.glow}
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#${uid}-soft)`}
        />

        <rect
          width="1000"
          height="1000"
          filter={`url(#${uid}-grain)`}
          opacity="0.09"
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>
    </motion.div>
  );
}

/** Sear marks laid over each silhouette so the art reads as grilled, not painted. */
const MARKS: Record<ModelKey, string[]> = {
  chicken: [
    "M368 448 C 420 528, 470 574, 540 606",
    "M452 414 C 496 500, 552 556, 626 588",
    "M542 404 C 578 490, 630 546, 700 574",
  ],
  burger: [
    "M330 634 C 400 656, 600 656, 670 634",
    "M336 560 C 410 582, 590 582, 664 560",
    "M348 446 C 416 468, 584 468, 652 446",
  ],
  ribs: [
    "M320 414 H 690",
    "M316 486 H 694",
    "M320 558 H 690",
    "M330 630 H 680",
  ],
  bowl: [
    "M352 452 C 420 500, 470 520, 520 508",
    "M560 600 C 610 570, 646 560, 676 566",
  ],
  dessert: [
    "M300 452 C 380 418, 470 412, 560 436",
    "M296 512 C 384 484, 480 480, 566 502",
  ],
};

type Shape =
  | {
      type: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rotate?: number;
      fill?: string;
      opacity?: number;
    }
  | { type: "path"; d: string; fill?: string; opacity?: number };

/**
 * Abstract, not literal. Each dish gets a recognisable arrangement of masses —
 * a bird with two legs, a stack, a fanned rack, a filled ring, a cut round.
 */
const SHAPES: Record<ModelKey, Shape[]> = {
  chicken: [
    { type: "ellipse", cx: 500, cy: 520, rx: 236, ry: 168, rotate: -8 },
    { type: "ellipse", cx: 500, cy: 468, rx: 150, ry: 96, rotate: -8, opacity: 0.6 },
    { type: "ellipse", cx: 330, cy: 624, rx: 118, ry: 56, rotate: 24 },
    { type: "ellipse", cx: 668, cy: 624, rx: 118, ry: 56, rotate: -24 },
    { type: "ellipse", cx: 246, cy: 662, rx: 34, ry: 20, rotate: 24, fill: "#e8dcc6" },
    { type: "ellipse", cx: 752, cy: 662, rx: 34, ry: 20, rotate: -24, fill: "#e8dcc6" },
    { type: "ellipse", cx: 742, cy: 452, rx: 52, ry: 50, fill: "#d9a52b", opacity: 0.9 },
    { type: "ellipse", cx: 268, cy: 448, rx: 42, ry: 40, fill: "#d9a52b", opacity: 0.75 },
    { type: "ellipse", cx: 430, cy: 700, rx: 26, ry: 12, fill: "#2f4a1c" },
    { type: "ellipse", cx: 592, cy: 690, rx: 22, ry: 10, fill: "#2f4a1c" },
  ],
  burger: [
    { type: "ellipse", cx: 500, cy: 640, rx: 226, ry: 62 },
    { type: "ellipse", cx: 500, cy: 566, rx: 240, ry: 54, fill: "#4d2410" },
    { type: "ellipse", cx: 500, cy: 512, rx: 262, ry: 40, fill: "#e8912a" },
    { type: "ellipse", cx: 500, cy: 452, rx: 240, ry: 54, fill: "#4d2410" },
    { type: "ellipse", cx: 500, cy: 402, rx: 250, ry: 34, fill: "#3f6b1f" },
    {
      type: "path",
      d: "M254 388 A 246 210 0 0 1 746 388 Z",
    },
    { type: "ellipse", cx: 432, cy: 268, rx: 12, ry: 8, fill: "#f0d9a8" },
    { type: "ellipse", cx: 520, cy: 240, rx: 12, ry: 8, fill: "#f0d9a8" },
    { type: "ellipse", cx: 596, cy: 288, rx: 12, ry: 8, fill: "#f0d9a8" },
  ],
  ribs: [
    { type: "ellipse", cx: 500, cy: 420, rx: 250, ry: 42, rotate: -4 },
    { type: "ellipse", cx: 500, cy: 492, rx: 254, ry: 42, rotate: -2 },
    { type: "ellipse", cx: 500, cy: 564, rx: 250, ry: 42, rotate: 2 },
    { type: "ellipse", cx: 500, cy: 636, rx: 240, ry: 42, rotate: 4 },
    { type: "ellipse", cx: 268, cy: 420, rx: 44, ry: 14, fill: "#e6dac4" },
    { type: "ellipse", cx: 264, cy: 492, rx: 44, ry: 14, fill: "#e6dac4" },
    { type: "ellipse", cx: 268, cy: 564, rx: 44, ry: 14, fill: "#e6dac4" },
    { type: "ellipse", cx: 276, cy: 636, rx: 44, ry: 14, fill: "#e6dac4" },
  ],
  bowl: [
    { type: "ellipse", cx: 500, cy: 540, rx: 250, ry: 236, fill: "#6f5417" },
    { type: "ellipse", cx: 500, cy: 540, rx: 250, ry: 236, opacity: 0.55 },
    { type: "ellipse", cx: 410, cy: 470, rx: 96, ry: 66, rotate: -18, fill: "#5f6b2a" },
    { type: "ellipse", cx: 604, cy: 590, rx: 88, ry: 60, rotate: 22, fill: "#5f6b2a" },
    { type: "ellipse", cx: 612, cy: 440, rx: 46, ry: 32, fill: "#9c1f10" },
    { type: "ellipse", cx: 392, cy: 636, rx: 40, ry: 28, fill: "#9c1f10" },
    { type: "ellipse", cx: 500, cy: 620, rx: 30, ry: 26, fill: "#f2ece0" },
    { type: "ellipse", cx: 520, cy: 424, rx: 26, ry: 22, fill: "#f2ece0" },
  ],
  dessert: [
    { type: "ellipse", cx: 470, cy: 520, rx: 226, ry: 210 },
    { type: "ellipse", cx: 470, cy: 496, rx: 226, ry: 196, fill: "#6b3a10" },
    {
      type: "path",
      d: "M470 496 L 690 430 A 226 210 0 0 1 660 620 Z",
      fill: "#120d0a",
    },
    { type: "ellipse", cx: 742, cy: 600, rx: 120, ry: 96, rotate: -22 },
    { type: "ellipse", cx: 300, cy: 704, rx: 74, ry: 40, fill: "#f7f1e6", opacity: 0.9 },
    { type: "ellipse", cx: 300, cy: 736, rx: 96, ry: 24, fill: "#c8871f", opacity: 0.85 },
  ],
};
