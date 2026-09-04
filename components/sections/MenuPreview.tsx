"use client";

import { menu } from "@/data/menu";
import { MenuRow } from "@/components/menu/MenuRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

/** Six items across four categories — a taste, with the full list one click away. */
const PREVIEW_IDS = [
  "peri-wings",
  "fire-grilled-chicken",
  "coal-ribs",
  "flame-burger",
  "grilled-cabbage",
  "burnt-cheesecake",
];

export function MenuPreview() {
  const items = PREVIEW_IDS.map((id) => menu.find((item) => item.id === id)!);

  return (
    <section
      className="grain relative border-t border-line py-24 md:py-32"
      aria-labelledby="menu-preview-heading"
    >
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionHeader index="03" label="The menu" />
            <h2
              id="menu-preview-heading"
              className="type-display mt-8 text-[clamp(2.4rem,7vw,6rem)] text-cream"
            >
              <RevealLines lines={["Everything", "off the coals."]} />
            </h2>
          </div>

          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-cream-dim">
              Starters, mains, the grill, drinks and desserts. Add what you want
              to the tray, or send a single dish straight to the kitchen.
            </p>
            <ButtonLink href="/menu" variant="outline" className="mt-6" arrow>
              Full menu
            </ButtonLink>
          </Reveal>
        </div>

        <ul className="mt-14 border-t border-line">
          {items.map((item, index) => (
            <MenuRow key={item.id} item={item} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
