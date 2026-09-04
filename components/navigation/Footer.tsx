import Link from "next/link";
import { site } from "@/config/site";
import { OrderButton } from "@/components/ui/OrderButton";
import { generalOrderMessage } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="shell py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="type-label">Order</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-dim">
              No app, no account. Send us a message and we&rsquo;ll confirm your
              order and a time.
            </p>
            <OrderButton
              message={generalOrderMessage()}
              size="lg"
              className="mt-6"
              arrow
            >
              Order on WhatsApp
            </OrderButton>
            <p className="mt-4 text-xs text-subtle">{site.whatsappDisplay}</p>
          </div>

          <div className="md:col-span-3">
            <p className="type-label">Find us</p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-cream-dim">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.city} {site.address.postcode}
            </address>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                site.address.mapsQuery,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[0.6875rem] uppercase tracking-[0.2em] text-ember underline-offset-4 hover:underline"
            >
              Get directions
            </a>
          </div>

          <div className="md:col-span-2">
            <p className="type-label">Hours</p>
            <ul className="mt-4 space-y-2 text-sm text-cream-dim">
              {site.hours.map((entry) => (
                <li key={entry.days}>
                  <span className="block text-xs text-subtle">{entry.days}</span>
                  {entry.time}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="type-label">More</p>
            <ul className="mt-4 space-y-2 text-sm">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream-dim transition-colors duration-200 hover:text-ember"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {site.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream-dim transition-colors duration-200 hover:text-ember"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the viewport edge. */}
      <div className="shell pb-6">
        <p
          aria-hidden
          className="type-display w-full text-[19vw] leading-[0.78] text-cream/8 select-none"
        >
          {site.name}
        </p>
        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-[0.6875rem] uppercase tracking-[0.18em] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
