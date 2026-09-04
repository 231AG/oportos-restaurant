import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  index: string;
  label: string;
  className?: string;
}

/** Numbered eyebrow with a hairline — the site's section marker. */
export function SectionHeader({ index, label, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="font-display text-sm leading-none text-ember">
        {index}
      </span>
      <span className="h-px w-10 bg-line-strong" />
      <span className="type-label">{label}</span>
    </div>
  );
}
