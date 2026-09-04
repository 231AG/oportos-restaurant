"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import { dishOrderMessage, formatMoney, whatsappUrl } from "@/lib/whatsapp";
import { HeatScale } from "@/components/ui/HeatScale";
import { useCart } from "./CartProvider";
import { cn } from "@/lib/utils";

/**
 * A menu row, not a menu card. The whole row is the hover target: the name
 * shifts, a hairline wash rises behind it, and the actions fade up on the
 * right — on touch they are simply always visible.
 */
export function MenuRow({ item, index }: { item: MenuItem; index: number }) {
  const { add, lastAdded } = useCart();
  const reduced = useReducedMotion();
  const justAdded = lastAdded === item.id;

  return (
    <motion.li
      className="group relative border-b border-line"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.04, 0.28),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-ink-panel transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-expo)] group-hover:scale-y-100"
      />

      <div className="relative flex flex-col gap-3 px-1 py-5 sm:flex-row sm:items-baseline sm:gap-6 md:px-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-xl uppercase leading-none tracking-[0.01em] transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 md:text-2xl">
              {item.name}
            </h3>
            <HeatScale level={item.heat} />
            {item.signature ? (
              <span className="type-label text-ember/90">Signature</span>
            ) : null}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-dim">
            {item.description}
          </p>
          {item.tags?.length ? (
            <p className="mt-2 text-[0.625rem] uppercase tracking-[0.2em] text-subtle">
              {item.tags.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <span className="font-display text-xl leading-none tabular-nums text-cream md:text-2xl">
            {formatMoney(item.price)}
          </span>

          <div className="flex items-center gap-2 opacity-100 transition-opacity duration-[var(--duration-ui)] md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              data-add-to-tray
              onClick={() =>
                add({ id: item.id, name: item.name, price: item.price })
              }
              className={cn(
                "h-9 border px-3 text-[0.625rem] uppercase tracking-[0.18em] transition-colors duration-[var(--duration-micro)]",
                justAdded
                  ? "border-ember bg-ember text-ink"
                  : "border-line-strong text-cream-dim hover:border-ember hover:text-ember",
              )}
              aria-label={`Add ${item.name} to tray`}
            >
              {justAdded ? "Added" : "Add"}
            </button>

            <a
              href={whatsappUrl(dishOrderMessage(item.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 border border-transparent bg-ember px-3 text-[0.625rem] uppercase leading-9 tracking-[0.18em] text-ink transition-colors duration-[var(--duration-micro)] hover:bg-ember-soft"
              aria-label={`Order ${item.name} on WhatsApp`}
            >
              Order
            </a>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
