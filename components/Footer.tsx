"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { whatsappLink, helloMessage } from "@/lib/whatsapp";
import { EASE_EXPO } from "@/lib/utils";
import ArchMark from "./ui/ArchMark";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const scrollTo = useScrollTo();
  const a = site.contact.address;

  return (
    <footer data-nav="dark" className="bg-ink pt-[12vh] text-bone" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {site.name}: contact
      </h2>
      <div className="gutter grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <ArchMark className="h-10 w-auto text-saffron" />
          <p className="mt-6 max-w-[22ch] font-serif text-[1.9rem] leading-[1.05]">
            {site.tagline}. <em>Karibu tena</em>: come back soon.
          </p>
        </div>
        <address className="label space-y-2 not-italic text-bone/70 md:col-span-2 md:col-start-6">
          <p className="text-bone/40">Visit</p>
          <p>{a.street}</p>
          <p>
            {a.area}, {a.city}
          </p>
          <p>{site.contact.coordinates}</p>
        </address>
        <div className="label space-y-2 text-bone/70 md:col-span-2">
          <p className="text-bone/40">Talk</p>
          <a className="block hover:text-saffron" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a className="block hover:text-saffron" href={site.contact.phoneHref}>
            {site.contact.phone}
          </a>
          <a className="block break-all hover:text-saffron" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
        </div>
        <nav aria-label="Footer" className="label space-y-2 text-bone/70 md:col-span-2">
          <p className="text-bone/40">Explore</p>
          {site.nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(n.href);
              }}
              className="block hover:text-saffron"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="label space-y-2 text-bone/70 md:col-span-2">
          <p className="text-bone/40">Follow</p>
          {site.social.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="block hover:text-saffron">
              {s.label}
            </a>
          ))}
          <p className="pt-3 text-bone/40">
            Check-in {site.contact.checkIn} · out {site.contact.checkOut}
          </p>
        </div>
      </div>

      <div ref={ref} aria-hidden="true" className="mt-[10vh] overflow-hidden">
        <p className="flex justify-center font-serif text-[33vw] leading-[0.74] tracking-[-0.05em]">
          {site.name.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: "100%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{ duration: 1.3, ease: EASE_EXPO, delay: i * 0.06 }}
            >
              {ch}
            </motion.span>
          ))}
        </p>
      </div>
      <div className="gutter label flex flex-col gap-2 border-t border-bone/10 py-5 text-bone/45 md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name} · Mombasa, Kenya
        </p>
        <p>Boutique hotel · Mombasa beach hotel · Swahili coast</p>
        <a href="#" className="hover:text-bone">
          Privacy
        </a>
      </div>
    </footer>
  );
}
