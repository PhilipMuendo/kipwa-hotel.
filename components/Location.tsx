"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/whatsapp";
import { EASE_EXPO } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * LOCATION: a hand-drawn chart of the Mombasa coast: the island in its
 * harbour, the fringing reef offshore, the house on the north shore, and the
 * routes in. Lines draw themselves when the chart comes into view. It's a
 * diagram, not a map, and it says so.
 */

const draw = (on: boolean, delay = 0, duration = 1.8) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: on ? { pathLength: 1, opacity: 1 } : undefined,
  transition: { duration, ease: EASE_EXPO, delay },
});

function Chart() {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.35 });
  const ink = "#0C0E0F";
  return (
    <svg ref={ref} viewBox="0 0 600 700" className="h-auto w-full" role="img" aria-label="Diagram of the Mombasa coast showing Kipwa on the north shore, Mombasa Island, the reef, the airport and the SGR terminus. Not to scale.">
      {/* ocean hatching */}
      <defs>
        <pattern id="sea" width="14" height="10" patternUnits="userSpaceOnUse">
          <path d="M0,5 C3.5,2 7,8 14,5" fill="none" stroke={ink} strokeOpacity="0.12" strokeWidth="0.8" />
        </pattern>
        <clipPath id="ocean">
          <path d="M350,0 C344,110 338,220 334,330 C300,336 250,338 222,352 C210,400 210,480 220,524 C255,536 300,538 330,540 C334,600 338,650 342,700 L600,700 L600,0 Z" />
        </clipPath>
      </defs>
      {/* land */}
      <motion.path
        d="M0,0 L350,0 C344,110 338,220 334,330 C300,336 250,338 222,352 C210,400 210,480 220,524 C255,536 300,538 330,540 C334,600 338,650 342,700 L0,700 Z"
        fill="#E9DFCF"
        initial={{ opacity: 0 }}
        animate={on ? { opacity: 1 } : undefined}
        transition={{ duration: 1.2 }}
      />
      <motion.rect x="0" y="0" width="600" height="700" fill="url(#sea)" clipPath="url(#ocean)" initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : undefined} transition={{ duration: 1.6 }} />

      {/* coastline with the harbour */}
      <motion.path
        d="M350,0 C344,110 338,220 334,330 C300,336 250,338 222,352 C210,400 210,480 220,524 C255,536 300,538 330,540 C334,600 338,650 342,700"
        fill="none"
        stroke={ink}
        strokeWidth="1.4"
        {...draw(on, 0, 2.4)}
      />
      {/* Mombasa Island */}
      <motion.path
        d="M258,384 C276,370 304,372 318,388 C330,404 330,470 318,494 C304,512 272,512 258,498 C246,480 244,402 258,384 Z"
        fill="#DCCDB4"
        stroke={ink}
        strokeWidth="1.2"
        {...draw(on, 0.5)}
      />
      {/* fringing reef */}
      <motion.path d="M392,10 C386,120 380,230 376,320" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="2 7" strokeLinecap="round" {...draw(on, 0.9)} />
      <motion.path d="M372,560 C376,610 380,660 384,700" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="2 7" strokeLinecap="round" {...draw(on, 1)} />

      {/* routes */}
      <motion.path d="M330,170 C326,250 322,320 312,360 C306,384 312,410 316,430" fill="none" stroke="#D9922E" strokeWidth="2" strokeDasharray="5 6" {...draw(on, 1.3)} />
      <motion.path d="M262,452 C232,470 205,500 182,588" fill="none" stroke={ink} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 5" {...draw(on, 1.5)} />
      <motion.path d="M258,440 C226,450 186,476 156,520" fill="none" stroke={ink} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 5" {...draw(on, 1.6)} />

      {/* places */}
      <g className="font-mono text-[11px] uppercase tracking-[0.1em]" fill={ink}>
        <motion.g initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : undefined} transition={{ delay: 1.8, duration: 0.8 }}>
          <circle cx="316" cy="430" r="3.5" fill={ink} />
          <text x="236" y="446" textAnchor="end" className="text-[10px]">Old Town</text>
          <text x="236" y="459" textAnchor="end" className="text-[10px]" opacity="0.6">Fort Jesus</text>
          <circle cx="182" cy="588" r="3.5" fill={ink} />
          <text x="170" y="608" textAnchor="end" className="text-[10px]">MBA Airport</text>
          <circle cx="156" cy="520" r="3.5" fill={ink} />
          <text x="144" y="516" textAnchor="end" className="text-[10px]">SGR Terminus</text>
          <text x="398" y="282" className="text-[10px]" opacity="0.6">Fringing reef</text>
          <text x="282" y="448" textAnchor="middle" className="text-[9px]" opacity="0.6">Mombasa</text>
          <text x="282" y="460" textAnchor="middle" className="text-[9px]" opacity="0.6">Island</text>
          <text x="470" y="430" textAnchor="middle" className="font-serif text-[22px] normal-case italic tracking-normal" opacity="0.55">Indian Ocean</text>
        </motion.g>
        {/* the house */}
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={on ? { opacity: 1, scale: 1 } : undefined} transition={{ delay: 2.1, duration: 0.9, ease: EASE_EXPO }} style={{ originX: "330px", originY: "170px" }}>
          <circle cx="330" cy="170" r="14" fill="#D9922E" opacity="0.18">
            <animate attributeName="r" values="10;22;10" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="330" cy="170" r="6" fill="#D9922E" />
          <text x="312" y="166" textAnchor="end" className="font-serif text-[26px] normal-case tracking-normal">Kipwa</text>
          <text x="312" y="182" textAnchor="end" className="text-[9px]" opacity="0.6">North Coast</text>
        </motion.g>
      </g>

      {/* north + legend */}
      <g transform="translate(540 60)" stroke={ink} fill="none">
        <path d="M0,18 L0,-18 M-6,-10 L0,-18 L6,-10" strokeWidth="1.2" />
        <text x="0" y="36" textAnchor="middle" className="font-mono text-[10px]" fill={ink} stroke="none">N</text>
      </g>
      <text x="580" y="690" textAnchor="end" className="font-mono text-[9px] uppercase tracking-[0.12em]" fill={ink} opacity="0.5">
        Diagram · not to scale
      </text>
    </svg>
  );
}

export default function Location() {
  const loc = site.location;
  return (
    <section id="location" data-nav="light" aria-labelledby="loc-title" className="plaster py-[16vh]">
      <div className="gutter grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5">
          <p className="label text-clay">(07) Location</p>
          <RevealLines as="h2" className="d-lg mt-6" lines={["Find the", <><em key="k">kipwa</em>.</>]} />
          <span id="loc-title" className="sr-only">
            Location: find Kipwa in Mombasa
          </span>
          <address className="lead mt-8 not-italic text-ink/80">
            {site.contact.address.street}, {site.contact.address.area}
            <br />
            {site.contact.address.city}, {site.contact.address.country}
            <br />
            <span className="label text-clay">{site.contact.coordinates}</span>
          </address>

          <dl className="mt-10 border-t border-ink/15">
            {loc.travel.map((t) => (
              <div key={t.code} className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-4">
                <dt className="flex items-baseline gap-3">
                  <span className="label w-12 text-clay">{t.code}</span>
                  <span className="text-[1rem]">{t.place}</span>
                </dt>
                <dd className="font-serif text-[1.5rem] leading-none">{t.time}</dd>
              </div>
            ))}
          </dl>
          <p className="label mt-4 text-clay">
            {loc.transfer}
            {loc.placeholder ? " · Times are approximate placeholders." : ""}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.contact.address.street}, ${site.contact.address.city}, Kenya`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[0.85rem] text-bone transition-colors hover:bg-saffron hover:text-ink"
            >
              Open in Maps
            </a>
            <a
              href={whatsappLink(`Hello ${site.name}, could you arrange an airport transfer?`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-ink/25 px-6 text-[0.85rem] hover:border-ink"
            >
              Arrange a transfer
            </a>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Chart />
        </div>
      </div>
    </section>
  );
}
