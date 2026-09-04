import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { OrderButton } from "@/components/ui/OrderButton";
import { generalOrderMessage } from "@/lib/whatsapp";
import { RevealLines } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Table not found",
};

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="ember-wash pointer-events-none absolute inset-0 opacity-70" />

      <div className="shell relative py-32">
        <p
          aria-hidden
          className="type-display text-[clamp(6rem,26vw,22rem)] leading-[0.78] text-cream/10"
        >
          404
        </p>

        <h1 className="type-display -mt-[6vw] text-[clamp(2rem,6.6vw,5.5rem)] text-cream">
          <span className="sr-only">404 — </span>
          <RevealLines
            lines={["This table", "doesn't exist."]}
            immediate
            stagger={0.1}
          />
        </h1>

        <p className="mt-8 max-w-md text-sm leading-relaxed text-cream-dim">
          The page you were looking for has been cleared away. The grill is still
          on, though.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/menu" size="lg" arrow>
            Back to the menu
          </ButtonLink>
          <OrderButton
            message={generalOrderMessage()}
            variant="outline"
            size="lg"
          >
            Order now
          </OrderButton>
        </div>
      </div>
    </section>
  );
}
