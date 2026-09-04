"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "./CartProvider";
import { OrderButton } from "@/components/ui/OrderButton";
import { cartOrderMessage, formatMoney } from "@/lib/whatsapp";

/**
 * The tray. Slides in from the right, traps Escape, restores focus on close and
 * ends in exactly one action: ORDER VIA WHATSAPP.
 */
export function CartDrawer() {
  const { lines, total, count, open, setOpen, increment, decrement, remove, clear } =
    useCart();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreTo.current = document.activeElement as HTMLElement | null;
      const id = window.setTimeout(() => {
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }, 60);
      return () => window.clearTimeout(id);
    }
    restoreTo.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Close tray"
            className="absolute inset-0 h-full w-full cursor-default bg-ink/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Your tray"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-ink-raised"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="type-label">Your tray</p>
                <p className="mt-1 font-display text-2xl uppercase leading-none">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="type-label transition-colors duration-200 hover:text-cream"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <p className="py-16 text-center text-sm text-cream-dim">
                  Nothing here yet. Add something from the menu — the tray becomes
                  one WhatsApp message.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-medium">
                          {line.name}
                        </p>
                        <p className="mt-1 text-xs text-subtle">
                          {formatMoney(line.price)} each
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(line.id)}
                          className="mt-2 text-[0.6875rem] uppercase tracking-[0.16em] text-subtle underline-offset-4 transition-colors duration-200 hover:text-ember hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            aria-label={`Decrease ${line.name}`}
                            onClick={() => decrement(line.id)}
                            className="h-8 w-8 text-cream-dim transition-colors duration-200 hover:bg-ink-panel hover:text-ember"
                          >
                            −
                          </button>
                          <span
                            className="w-7 text-center text-sm tabular-nums"
                            aria-live="polite"
                          >
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.name}`}
                            onClick={() => increment(line.id)}
                            className="h-8 w-8 text-cream-dim transition-colors duration-200 hover:bg-ink-panel hover:text-ember"
                          >
                            +
                          </button>
                        </div>
                        <span className="w-16 text-right text-sm tabular-nums">
                          {formatMoney(line.price * line.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-line px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="type-label">Total</span>
                <span className="font-display text-3xl leading-none">
                  {formatMoney(total)}
                </span>
              </div>

              <OrderButton
                message={cartOrderMessage(lines, total)}
                size="lg"
                className="mt-5 w-full"
                arrow
              >
                Order via WhatsApp
              </OrderButton>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[0.6875rem] leading-relaxed text-subtle">
                  Payment happens in the restaurant or on delivery.
                </p>
                {lines.length > 0 ? (
                  <button
                    type="button"
                    onClick={clear}
                    className="shrink-0 text-[0.6875rem] uppercase tracking-[0.16em] text-subtle transition-colors duration-200 hover:text-ember"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </footer>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
