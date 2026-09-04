"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/config/site";
import { generalOrderMessage } from "@/lib/whatsapp";
import { OrderButton } from "@/components/ui/OrderButton";
import { useCart } from "@/components/menu/CartProvider";
import { cn } from "@/lib/utils";

/**
 * Minimal by design: wordmark, three links, one order action.
 * On scroll the bar contracts and picks up a hairline + blur, so it stops
 * floating over the hero without ever becoming a solid block.
 */
export function Nav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ember focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-ink"
      >
        Skip to content
      </a>

      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--duration-ui)]",
          scrolled
            ? "border-b border-line bg-ink/72 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
        initial={reduced ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: reduced ? 0 : 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "shell flex items-center justify-between transition-[padding] duration-[var(--duration-ui)] ease-[var(--ease-out-expo)]",
            scrolled ? "py-3" : "py-5",
          )}
        >
          <Link
            href="/"
            className="group relative font-display text-xl tracking-[0.06em] uppercase leading-none md:text-2xl"
            aria-label={`${site.name} — home`}
          >
            {site.name}
            <span
              aria-hidden
              className="absolute -right-2.5 top-0 h-1.5 w-1.5 rounded-full bg-ember transition-transform duration-[var(--duration-micro)] group-hover:scale-150"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-9 md:flex"
          >
            {site.nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative py-1 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-[var(--duration-micro)]",
                    active ? "text-cream" : "text-cream-dim hover:text-cream",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ember transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-expo)]",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative hidden h-9 items-center px-3 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-cream-dim transition-colors duration-[var(--duration-micro)] hover:text-cream sm:inline-flex"
            >
              Tray
              <span
                className={cn(
                  "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.625rem] tabular-nums transition-colors duration-200",
                  count > 0 ? "bg-ember text-ink" : "bg-ink-panel text-subtle",
                )}
              >
                {count}
              </span>
            </button>

            {/* Wrapped rather than given `hidden sm:inline-flex` directly: the
                button's own `inline-flex` and a `hidden` utility are the same
                CSS property, and without tailwind-merge the winner is whichever
                Tailwind emits last — which is how this shipped visible on a
                390px viewport the first time. */}
            <span className="hidden sm:contents">
              <OrderButton
                message={generalOrderMessage()}
                size="md"
                showMark={false}
              >
                Order now
              </OrderButton>
            </span>

            <button
              type="button"
              className="relative z-[60] flex h-9 w-9 items-center justify-center md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 block h-px w-6 bg-cream transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-px w-6 bg-cream transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-expo)]",
                    menuOpen ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const { count, setOpen } = useCart();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          className="fixed inset-0 z-[55] flex flex-col bg-ink md:hidden"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ember-wash pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70" />

          <nav
            aria-label="Mobile"
            className="relative mt-24 flex flex-1 flex-col justify-center gap-2 px-6"
          >
            {site.nav.map((item, index) => (
              <motion.div
                key={item.href}
                initial={reduced ? false : { y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="type-display block py-2 text-[15vw] leading-[0.9] text-cream transition-colors duration-200 hover:text-ember"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="relative border-t border-line px-6 py-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                setOpen(true);
              }}
              className="mb-4 type-label text-cream-dim"
            >
              Tray ({count})
            </button>
            <OrderButton
              message={generalOrderMessage()}
              size="lg"
              className="w-full"
              arrow
            >
              Order on WhatsApp
            </OrderButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
