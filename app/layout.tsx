import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { site } from "@/config/site";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { BookingProvider } from "@/lib/booking";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s | ${site.name}` },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.seo.title, description: site.seo.description, locale: "en_KE" },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: site.brand.bone, width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: site.name,
  description: site.seo.description,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.street,
    addressLocality: site.contact.address.city,
    addressRegion: "Mombasa County",
    addressCountry: "KE",
  },
  geo: { "@type": "GeoCoordinates", latitude: -4.0435, longitude: 39.6682 },
  checkinTime: site.contact.checkIn,
  checkoutTime: site.contact.checkOut,
  priceRange: `KES ${Math.min(...site.rooms.map((r) => r.rate)).toLocaleString("en-KE")}+`,
  numberOfRooms: site.facts[0].value,
  amenityFeature: ["Beachfront", "Pool", "Spa", "Restaurant", "Free WiFi", "Airport transfer"].map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  sameAs: site.social.map((s) => s.href),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const vars = {
    "--brand-ink": site.brand.ink,
    "--brand-bone": site.brand.bone,
    "--brand-sand": site.brand.sand,
    "--brand-clay": site.brand.clay,
    "--brand-accent": site.brand.accent,
  } as CSSProperties;
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} style={vars}>
      <body>
        {/* the Swahili pointed arch, shared by every arched frame on the site */}
        <svg width="0" height="0" aria-hidden="true" className="absolute">
          <clipPath id="arch" clipPathUnits="objectBoundingBox">
            <path d="M0,1 L0,0.36 C0,0.2 0.2,0.07 0.5,0 C0.8,0.07 1,0.2 1,0.36 L1,1 Z" />
          </clipPath>
        </svg>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          <BookingProvider>{children}</BookingProvider>
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
