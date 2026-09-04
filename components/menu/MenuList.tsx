"use client";

import { categories, itemsByCategory, type CategoryId } from "@/data/menu";
import { MenuRow } from "./MenuRow";
import { Reveal } from "@/components/motion/Reveal";

export function MenuCategory({ id }: { id: CategoryId }) {
  const category = categories.find((entry) => entry.id === id);
  const items = itemsByCategory(id);
  if (!category) return null;

  return (
    <section
      id={category.id}
      className="scroll-mt-28 border-t border-line pt-10 md:pt-14"
      aria-labelledby={`${category.id}-heading`}
    >
      <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2
          id={`${category.id}-heading`}
          className="type-display text-[clamp(2rem,5.4vw,4.2rem)] text-cream"
        >
          {category.name}
        </h2>
        <p className="max-w-sm text-sm text-cream-dim md:text-right">
          {category.blurb}
        </p>
      </Reveal>

      <ul className="mt-8 border-t border-line">
        {items.map((item, index) => (
          <MenuRow key={item.id} item={item} index={index} />
        ))}
      </ul>
    </section>
  );
}

export function FullMenu() {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {categories.map((category) => (
        <MenuCategory key={category.id} id={category.id} />
      ))}
    </div>
  );
}
