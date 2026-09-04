import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { RevealLines, Reveal } from "@/components/motion/Reveal";

interface PageHeaderProps {
  index: string;
  label: string;
  /** One string per visual line — line breaks stay art-directed. */
  title: string[];
  lede?: string;
  children?: ReactNode;
}

/** Shared masthead for the inner pages, so /menu, /story and /contact rhyme. */
export function PageHeader({
  index,
  label,
  title,
  lede,
  children,
}: PageHeaderProps) {
  return (
    <header className="grain relative overflow-hidden pt-32 pb-14 md:pt-44 md:pb-20">
      <div className="ember-wash pointer-events-none absolute inset-x-0 -top-1/3 h-[120%] opacity-60" />

      <div className="shell relative">
        <SectionHeader index={index} label={label} />

        <h1 className="type-display mt-8 text-[clamp(2.6rem,9vw,8rem)] text-cream">
          <RevealLines lines={title} immediate stagger={0.1} />
        </h1>

        {lede || children ? (
          <Reveal
            className="mt-10 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-start md:justify-between"
            delay={0.2}
          >
            {lede ? (
              <p className="max-w-xl text-sm leading-relaxed text-cream-dim md:text-base">
                {lede}
              </p>
            ) : (
              <span />
            )}
            {children ? <div className="shrink-0">{children}</div> : null}
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
