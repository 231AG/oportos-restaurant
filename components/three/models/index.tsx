"use client";

import type { ComponentType } from "react";
import { Chicken } from "./Chicken";
import { Burger } from "./Burger";
import { Ribs } from "./Ribs";
import { Bowl } from "./Bowl";
import { Dessert } from "./Dessert";
import type { DishModelProps, ModelKey } from "../types";

export const dishModels: Record<ModelKey, ComponentType<DishModelProps>> = {
  chicken: Chicken,
  burger: Burger,
  ribs: Ribs,
  bowl: Bowl,
  dessert: Dessert,
};

export { Chicken, Burger, Ribs, Bowl, Dessert };
