"use client";

import { animate, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import OceanCanvas from "./OceanCanvas";
import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { usePrefersReducedMotion, useViewport } from "@/lib/useMedia";
import { whatsappLink, helloMessage } from "@/lib/whatsapp";
import { EASE_EXPO } from "@/lib/utils";
import dawnDhow from "@/assets/images/dawn-dhow.jpg";

/*
 * HERO: a lime-washed wall with a Swahili arch cut into it. Through the arch,
 * a live Indian Ocean at sunrise. On load the doorway opens; on scroll you
 * step through it: the arch grows past the edges of the screen, the sun climbs,
 * and "Karibu" greets you on the open water before the next section slides over.
 */

type Geo = { W: number; H: number; x: number; y: number; w: number; h: number };

function archPath(x: number, y: number, w: number, h: number) {
  return `M${x},${y + h} L${x},${y + 0.36 * h} C${x},${y + 0.2 * h} ${x + 0.2 * w},${y + 0.07 * h} ${x + 0.5 * w},${y} C${x + 0.8 * w},${y + 0.07 * h} ${x + w},${y + 0.2 * h} ${x + w},${y + 0.36 * h} L${x + w},${y + h} Z`;
}

function scaled(g: Geo, k: number) {
  // grow about a point a little below the crown, so you walk *into* the view
  const cx = g.x + g.w / 2;
  const cy = g.y + g.h * 0.42;
  const w = g.w * k, h = g.h * k;
  return { x: cx - w / 2, y: cy - (g.h * 0.42) * k, w, h };
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const vp = useViewport();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const geo: Geo | null = useMemo(() => {
    if (!vp) return null;
    const { w: W, h: H } = vp;
    if (W < 768) {
      const w = W * 0.66, h = H * 0.5;
      return { W, H, x: (W - w) / 2, y: H * 0.15, w, h };
    }
    const w = Math.min(W * 0.3, H * 0.46), h = H * 0.8;
    return { W, H, x: (W - w) / 2, y: H * 0.2, w, h };
  }, [vp]);

  // the door opens on load
  const opening = useMotionValue(reduce ? 1 : 0.0001);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!geo) return;
    setReady(true);
    if (reduce) {
      opening.set(1);
      return;
    }
    const c = animate(opening, 1, { duration: 1.9, ease: [0.65, 0, 0.35, 1], delay: 0.15 });
    return () => c.stop();
  }, [geo, reduce, opening]);

  const grow = useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, v / 0.42));
    return 1 + Math.pow(t, 2.2) * 11;
  });
  const k = useTransform(() => grow.get() * opening.get());
  const wall = useTransform(k, (kk) => {
    if (!geo) return "";
    const a = scaled(geo, kk);
    return `M0,0 H${geo.W} V${geo.H} H0 Z ${archPath(a.x, a.y, a.w, a.h)}`;
  });
  const jamb = useTransform(k, (kk) => {
    if (!geo) return "";
    const a = scaled(geo, kk);
    const t = a.w * 0.045;
    return `${archPath(a.x, a.y, a.w, a.h)} ${archPath(a.x + t, a.y + t * 0.55, a.w - t, a.h)}`;
  });

  const hour = useTransform(p, [0, 0.6], [0.247, 0.305]);
  const leftX = useTransform(p, [0, 0.3], ["0vw", "-12vw"]);
  const rightX = useTransform(p, [0, 0.3], ["0vw", "12vw"]);
  const wordsOpacity = useTransform(p, [0.04, 0.26], [1, 0]);
  const uiOpacity = useTransform(p, (v) => 1 - Math.min(1, v / 0.1));
  const karibuOpacity = useTransform(p, [0.34, 0.44, 0.58, 0.66], [0, 1, 1, 0]);
  const karibuY = useTransform(p, [0.34, 0.66], ["6vh", "-6vh"]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const word = (delay: number) => ({
    initial: { y: "110%" },
    animate: { y: "0%" },
    transition: { duration: 1.4, ease: EASE_EXPO, delay },
  });

  return (
    <section ref={ref} id="top" data-nav="light" aria-labelledby="hero-title" className="relative h-[330svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <OceanCanvas hour={hour} horizon={vp && vp.w < 768 ? 0.52 : 0.4} fallback={dawnDhow} priority className="absolute inset-0 h-full w-full" />

        {/* the wall, with the doorway cut out of it */}
        {geo && ready ? (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${geo.W} ${geo.H}`} aria-hidden="true">
            <defs>
              <linearGradient id="jamb" x1="0" x2="1">
                <stop offset="0" stopColor="#CDBDA2" />
                <stop offset="1" stopColor="#E7DBC7" />
              </linearGradient>
            </defs>
            <motion.path d={jamb} fill="url(#jamb)" fillRule="evenodd" />
            <motion.path d={wall} fill="#F3EDE3" fillRule="evenodd" />
          </svg>
        ) : (
          <div className="plaster absolute inset-0" />
        )}

        {/* headline, split around the doorway */}
        <h1 id="hero-title" className="pointer-events-none">
          <span className="sr-only">{site.name}: the tide keeps the time. A boutique hotel on the Swahili coast, Mombasa.</span>
          <motion.span
            aria-hidden="true"
            className="absolute right-[calc(50%+min(15vw,23svh)+2.5vw)] top-[30svh] hidden text-right font-serif text-[clamp(3rem,7.2vw,9.5rem)] leading-[0.9] tracking-[-0.035em] md:block"
            style={{ x: mounted ? leftX : 0, opacity: mounted ? wordsOpacity : 1 }}
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...word(0.6)}>The</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block italic" {...word(0.7)}>tide</motion.span>
            </span>
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="absolute left-[calc(50%+min(15vw,23svh)+2.5vw)] top-[50svh] hidden font-serif text-[clamp(3rem,7.2vw,9.5rem)] leading-[0.9] tracking-[-0.035em] md:block"
            style={{ x: mounted ? rightX : 0, opacity: mounted ? wordsOpacity : 1 }}
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...word(0.8)}>keeps</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...word(0.9)}>
                the time<span className="text-saffron">.</span>
              </motion.span>
            </span>
          </motion.span>
          {/* mobile: under the arch */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 top-[66svh] block text-center font-serif text-[13.5vw] leading-[0.92] tracking-[-0.035em] md:hidden"
            style={{ opacity: mounted ? wordsOpacity : 1 }}
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...word(0.6)}>
                The <em>tide</em> keeps
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...word(0.75)}>
                the time<span className="text-saffron">.</span>
              </motion.span>
            </span>
          </motion.span>
        </h1>

        {/* meta */}
        <motion.div
          className="gutter label pointer-events-none absolute inset-x-0 top-[5.75rem] hidden justify-between text-clay md:flex"
          style={{ opacity: mounted ? uiOpacity : 1 }}
        >
          <span>{site.tagline} · Mombasa, Kenya</span>
          <span>{site.contact.coordinates}</span>
        </motion.div>

        {/* intro + actions */}
        <motion.div
          className="gutter absolute inset-x-0 bottom-[var(--gutter)] flex flex-col items-center gap-5 md:flex-row md:items-end md:justify-between"
          style={{ opacity: mounted ? uiOpacity : 1 }}
        >
          <div className="flex flex-col items-center gap-5 md:max-w-[min(30vw,24rem)] md:items-start">
            <motion.p
              className="hidden text-[0.98rem] leading-snug text-ink/80 md:block"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: EASE_EXPO, delay: 1.3 }}
            >
              Twenty-four rooms on the shore the sea gives back at low tide. Mombasa&apos;s north coast, ten minutes from the reef.
            </motion.p>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: EASE_EXPO, delay: 1.45 }}
            >
              <a
                href="#book"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#book");
                }}
                className="group relative inline-flex h-12 items-center overflow-hidden rounded-full bg-ink px-6 text-[0.85rem] text-bone"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-saffron transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
                <span className="relative transition-colors duration-500 group-hover:text-ink">Check availability</span>
              </a>
              <a
                href={whatsappLink(helloMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/25 bg-bone px-5 text-[0.85rem] transition-colors duration-300 hover:border-ink"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </motion.div>
          </div>
          <p className="label hidden text-clay md:block">Scroll · step through</p>
        </motion.div>

        {/* Karibu: on the open water */}
        <motion.p
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-bone"
          style={{ opacity: karibuOpacity, y: karibuY }}
        >
          <span className="font-serif text-[clamp(4.5rem,15vw,17rem)] italic leading-none tracking-[-0.04em] [text-shadow:0_2px_40px_rgba(12,14,15,0.25)]">Karibu</span>
          <span className="label mt-4 text-bone/85">Welcome to the coast</span>
        </motion.p>
      </div>
    </section>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
