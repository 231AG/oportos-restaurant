"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SignatureDish } from "@/data/menu";
import { DishArt } from "@/components/three/fallback/DishArt";
import { OrderButton } from "@/components/ui/OrderButton";
import { Button } from "@/components/ui/Button";
import { dishOrderMessage, formatMoney } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { HeatScale } from "@/components/ui/HeatScale";

interface DishDetailProps {
  dish: SignatureDish | null;
  onClose: () => void;
}

/**
 * Dish detail panel.
 *
 * Uses the SVG art rather than a second WebGL canvas on purpose: the showcase
 * canvas is still mounted behind the overlay, and two live scenes on one screen
 * is exactly the kind of thing that turns a 60fps page into a 25fps one.
 */
export function DishDetail({ dish, onClose }: DishDetailProps) {
  const reduced = useReducedMotion();
  const { add } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dish) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => closeRef.current?.focus(), 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(id);
    };
  }, [dish, onClose]);

  return (
    <AnimatePresence>
      {dish ? (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Close dish details"
            onClick={onClose}
            className="fixed inset-0 h-full w-full cursor-default bg-ink/88 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={dish.name}
            className="relative mx-auto my-[6vh] w-[min(92vw,68rem)] border border-line bg-ink-raised"
            initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="type-label">
                Dish {dish.index} — {dish.kicker}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="type-label transition-colors duration-200 hover:text-ember"
              >
                Close
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              <div
                className="relative aspect-square w-full"
                style={{ backgroundColor: dish.palette.wash }}
              >
                <DishArt
                  model={dish.model}
                  palette={dish.palette}
                  label={`${dish.name} illustration`}
                />
              </div>

              <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
                <div>
                  <h2 className="type-display text-[clamp(2rem,4.6vw,3.6rem)] text-cream">
                    {dish.name}
                  </h2>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="font-display text-2xl text-ember">
                      {formatMoney(dish.price)}
                    </span>
                    <HeatScale level={dish.heat} />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-cream-dim">
                  {dish.description}
                </p>

                <div>
                  <p className="type-label">In the dish</p>
                  <ul className="mt-3 grid gap-y-2 text-sm text-cream-dim sm:grid-cols-2">
                    {dish.ingredients.map((ingredient) => (
                      <li key={ingredient} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ember"
                        />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <OrderButton
                    message={dishOrderMessage(dish.name)}
                    size="lg"
                    arrow
                  >
                    Order via WhatsApp
                  </OrderButton>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      add({ id: dish.id, name: dish.name, price: dish.price })
                    }
                  >
                    Add to tray
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
