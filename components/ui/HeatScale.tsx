import { cn } from "@/lib/utils";

/** Three flames, filled to the dish's heat. Text label kept for screen readers. */
export function HeatScale({
  level = 0,
  className,
}: {
  level?: 0 | 1 | 2 | 3;
  className?: string;
}) {
  if (!level) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="sr-only">Heat level {level} of 3</span>
      {[1, 2, 3].map((step) => (
        <svg
          key={step}
          aria-hidden
          viewBox="0 0 12 16"
          className={cn(
            "h-3 w-2.5",
            step <= level ? "text-ember" : "text-ink-line",
          )}
          fill="currentColor"
        >
          <path d="M6 0c1 3-1 4 .5 6.5C7.5 8 9 8.5 9.5 10.5c.8 3-1.4 5.5-3.5 5.5S2 13.5 2.8 10.5C3.3 8.6 5 8.2 5.2 6 5.3 4.4 5 2.4 6 0Z" />
        </svg>
      ))}
    </span>
  );
}
