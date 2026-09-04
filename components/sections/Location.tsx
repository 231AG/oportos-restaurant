"use client";

import { site } from "@/config/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { OrderButton } from "@/components/ui/OrderButton";
import { ButtonLink } from "@/components/ui/Button";
import { generalOrderMessage, reservationMessage } from "@/lib/whatsapp";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.address.mapsQuery,
)}`;

/**
 * Location block, shared by the homepage and /contact.
 * The "map" is a drawn schematic, not an embedded iframe: no third-party
 * script, no cookie banner, no 400KB of tiles for what is a single address.
 */
export function Location({ index = "05" }: { index?: string }) {
  return (
    <section
      className="grain relative border-t border-line py-24 md:py-32"
      aria-labelledby="location-heading"
    >
      <div className="shell grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <SectionHeader index={index} label="Location" />
          <h2
            id="location-heading"
            className="type-display mt-8 text-[clamp(2.2rem,6vw,5rem)] text-cream"
          >
            <RevealLines lines={["Find the", "fire."]} />
          </h2>

          <Reveal delay={0.08}>
            <address className="mt-8 text-base not-italic leading-relaxed text-cream-dim">
              {site.address.line1}
              <br />
              {site.address.line2}, {site.address.city} {site.address.postcode}
            </address>

            <dl className="mt-8 space-y-3 border-t border-line pt-6">
              {site.hours.map((entry) => (
                <div
                  key={entry.days}
                  className="flex items-baseline justify-between gap-6"
                >
                  <dt className="text-xs uppercase tracking-[0.18em] text-subtle">
                    {entry.days}
                  </dt>
                  <dd className="text-sm tabular-nums text-cream">
                    {entry.time}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <OrderButton message={generalOrderMessage()} size="lg" arrow>
                Order on WhatsApp
              </OrderButton>
              <ButtonLink href={mapsHref} external variant="outline" size="lg">
                Get directions
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-cream-dim">
              Booking a table?{" "}
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
                  reservationMessage(),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember underline-offset-4 hover:underline"
              >
                Message us
              </a>{" "}
              or call {site.phone}.
            </p>
          </Reveal>
        </div>

        <Reveal className="md:col-span-6 md:col-start-7" delay={0.12}>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/3] w-full overflow-hidden border border-line bg-ink-raised"
            aria-label="Open the restaurant location in Google Maps"
          >
            <MapSchematic />
            <span className="absolute bottom-4 left-4 flex items-center gap-2 bg-ink/80 px-3 py-2 text-[0.625rem] uppercase tracking-[0.2em] text-cream backdrop-blur-sm transition-colors duration-200 group-hover:text-ember">
              {site.address.line1} — open in maps
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function MapSchematic() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="h-full w-full"
      role="img"
      aria-label={`Schematic map of ${site.address.mapsQuery}`}
    >
      <rect width="800" height="600" fill="#100c09" />

      {/* Street grid */}
      <g stroke="#241a14" strokeWidth="18" strokeLinecap="square">
        <path d="M-20 180 H820" />
        <path d="M-20 430 H820" />
        <path d="M200 -20 V620" />
        <path d="M540 -20 V620" />
        <path d="M60 620 L360 -20" />
      </g>
      <g stroke="#1a130f" strokeWidth="6">
        <path d="M-20 300 H820" />
        <path d="M370 -20 V620" />
        <path d="M660 -20 V620" />
      </g>

      {/* Blocks */}
      <g fill="#161010">
        <rect x="230" y="210" width="110" height="80" />
        <rect x="400" y="210" width="110" height="80" />
        <rect x="230" y="330" width="110" height="70" />
        <rect x="570" y="210" width="90" height="190" />
      </g>

      {/* Marker */}
      <g>
        <circle cx="400" cy="330" r="54" fill="#ff5b23" opacity="0.12" />
        <circle cx="400" cy="330" r="30" fill="#ff5b23" opacity="0.22" />
        <circle cx="400" cy="330" r="8" fill="#ff5b23" />
      </g>

      <text
        x="400"
        y="380"
        textAnchor="middle"
        fill="#f4ece0"
        fontSize="18"
        letterSpacing="4"
        fontFamily="Inter Variable, system-ui, sans-serif"
      >
        OPORTOS
      </text>
    </svg>
  );
}
