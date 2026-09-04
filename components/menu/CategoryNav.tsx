"use client";

import { useEffect, useState } from "react";
import { categories } from "@/data/menu";
import { cn } from "@/lib/utils";

/**
 * Sticky category rail. Scroll-spy is a plain IntersectionObserver on the
 * category sections — no scroll listener, no layout reads per frame.
 */
export function CategoryNav() {
  const [active, setActive] = useState<string>(categories[0].id);

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Menu categories"
      className="mask-fade-x sticky top-[3.25rem] z-30 -mx-5 mb-12 overflow-x-auto border-y border-line bg-ink px-5 md:top-[3.75rem] md:mx-0 md:px-0"
    >
      <ul className="flex min-w-max items-center gap-6 py-4 md:gap-8">
        {categories.map((category) => (
          <li key={category.id}>
            <a
              href={`#${category.id}`}
              aria-current={active === category.id ? "true" : undefined}
              className={cn(
                "group flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] transition-colors duration-[var(--duration-micro)]",
                active === category.id
                  ? "text-cream"
                  : "text-subtle hover:text-cream-dim",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "h-1 w-1 rounded-full transition-colors duration-[var(--duration-micro)]",
                  active === category.id ? "bg-ember" : "bg-ink-line",
                )}
              />
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
