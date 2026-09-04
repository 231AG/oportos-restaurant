import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { Nav } from "@/components/navigation/Nav";
import { Footer } from "@/components/navigation/Footer";
import { CartProvider } from "@/components/menu/CartProvider";
import { CartDrawer } from "@/components/menu/CartDrawer";
import SmoothScroll from "@/components/motion/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "en_GB",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0806",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `data-scroll-behavior="smooth"` restores Next's pre-16 handling: because
    // this site sets `scroll-behavior: smooth` on <html> for in-page anchors,
    // without it every route change would smooth-scroll to the top instead of
    // landing there instantly. See next/dist/docs .../upgrading/version-16.md.
    <html lang="en-GB" className="h-full" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-ink text-cream antialiased">
        <CartProvider>
          <SmoothScroll />
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
