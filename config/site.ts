/**
 * Single source of truth for brand, contact and ordering configuration.
 * The WhatsApp number lives here and nowhere else (see `lib/whatsapp.ts`).
 */

export const site = {
  name: "OPORTOS",
  tagline: "Bold flavour. Made memorable.",
  description:
    "OPORTOS is a flame-grilled kitchen in London. Peri-marinated chicken, coal-fired cuts and a fire that never goes out. Order in seconds on WhatsApp.",
  url: "https://oportos.example",
  founded: 2014,

  /**
   * International format, digits only — WhatsApp's click-to-chat API rejects
   * spaces, dashes and a leading `+`.
   * This is an Ofcom drama-reserved number, safe to publish in a portfolio build.
   */
  whatsappNumber: "447700900123",
  /** Human-readable version of the same number, for display only. */
  whatsappDisplay: "+44 7700 900123",

  phone: "+44 20 7946 0123",
  email: "hello@oportos.example",

  currency: "£",

  address: {
    line1: "12 Ember Yard",
    line2: "Shoreditch",
    city: "London",
    postcode: "E1 6QL",
    country: "United Kingdom",
    /** Used for the "Get directions" link — no API key, no embedded map iframe. */
    mapsQuery: "12 Ember Yard, Shoreditch, London E1 6QL",
  },

  hours: [
    { days: "Monday — Thursday", time: "12:00 — 22:30" },
    { days: "Friday — Saturday", time: "12:00 — 00:00" },
    { days: "Sunday", time: "12:00 — 21:00" },
  ],

  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],

  nav: [
    { label: "Menu", href: "/menu" },
    { label: "Our Story", href: "/story" },
    { label: "Location", href: "/contact" },
  ],
} as const;

export type Site = typeof site;
