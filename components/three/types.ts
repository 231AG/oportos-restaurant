import type { ModelKey, SignatureDish } from "@/data/menu";

export type Quality = "full" | "reduced";

export type Palette = SignatureDish["palette"];

export interface DishModelProps {
  palette: Palette;
  quality: Quality;
}

export type { ModelKey };
