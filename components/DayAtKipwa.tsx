"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import OceanCanvas from "./OceanCanvas";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { EASE_EXPO, pad } from "@/lib/utils";
import dawnDhow from "@/assets/images/dawn-dhow.jpg";

/*
 * A DAY AT KIPWA: the signature sequence. The section pins; scrolling winds
 * the clock from first light to moonrise. The live ocean behind it follows the
 * hour: sunrise road, white noon, saffron afterglow, moon road. Each stop is a
 * moment in the house, framed in an arch.
 */

const DAY = site.day;
const N = DAY.length;

const toClock = (h: number) => {
  const mins = Math.round(h * 24 * 60) % (24 * 60);
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
};
const ease = (t: number) => t * t * (3 - 2 * t);

export default function DayAtKipwa() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // hold on each moment, then let the sky travel to the next
  const hour = useTransform(p, (v) => {
    const x = Math.min(N - 1e-4, Math.max(0, v * N));
    const k = Math.floor(x);
    const t = x - k;
    const a = DAY[k].hour;
    const b = k + 1 < N ? DAY[k + 1].hour : 0.995;
    return a + (b - a) * ease(Math.max(0, (t - 0.55) / 0.45));
  });

  useMotionValueEvent(hour, "change", (h) => {
    if (clockRef.current) clockRef.current.textContent = toClock(h);
  });
  useMotionValueEvent(p, "change", (v) => {
    const k = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    if (k !== i) setI(k);
  });
  const fill = useTransform(p, [0, 1], [0, 1]);

  if (reduce) {
    return (
      <section id="day" data-nav="light" aria-labelledby="day-title" className="bg-bone py-[14vh]">
        <div className="gutter">
          <p className="label text-clay">(03) A day at {site.name}</p>
          <h2 id="day-title" className="d-lg mt-6">A day, from first light to moonrise</h2>
        </div>
        <ol className="gutter mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          {DAY.map((m) => (
            <li key={m.time}>
              <div className="arch relative aspect-[4/5] overflow-hidden">
                <Image src={m.image.src} alt={m.image.alt} fill sizes="50vw" className="object-cover" />
              </div>
              <p className="mt-4 font-serif text-[3rem] leading-none">{m.time}</p>
              <h3 className="mt-2 font-serif text-[1.8rem]">{m.title}</h3>
              <p className="mt-2 max-w-[40ch] text-ink/80">{m.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const m = DAY[i];

  return (
    <section ref={ref} id="day" data-nav="dark" aria-labelledby="day-title" className="relative bg-ink text-bone" style={{ height: `${N * 75 + 100}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <OceanCanvas hour={hour} horizon={0.3} fallback={dawnDhow} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(12,14,15,0.62)_0%,rgba(12,14,15,0.28)_45%,rgba(12,14,15,0.05)_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/55 to-transparent" />

        <div className="gutter relative flex h-full flex-col pb-[calc(var(--gutter)+3.5rem)] pt-[6.5rem] md:pb-[calc(var(--gutter)+4.5rem)]">
          <div className="flex items-start justify-between">
            <h2 id="day-title" className="label text-bone/80">
              (03) A day at {site.name}
            </h2>
            <p className="label tabular-nums text-bone/80" aria-hidden="true">
              {pad(i + 1)} / {pad(N)}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-1 items-end gap-8 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-7">
              <p className="font-serif leading-[0.8] tracking-[-0.05em] [text-shadow:0_2px_60px_rgba(12,14,15,0.35)]" aria-live="polite">
                <span className="sr-only">{m.time}</span>
                <span ref={clockRef} aria-hidden="true" className="block text-[clamp(5.5rem,17vw,19rem)] tabular-nums">
                  {DAY[0].time}
                </span>
              </p>
              <div className="relative mt-4 min-h-[9.5rem] max-w-[34rem] md:mt-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={m.time}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.6, ease: EASE_EXPO }}
                  >
                    <h3 className="d-md">{m.title}</h3>
                    <p className="mt-3 text-[1rem] leading-relaxed text-bone/85">{m.body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden justify-end md:col-span-4 md:col-start-9 md:flex">
              <div className="arch relative h-[54svh] w-full max-w-[24rem] overflow-hidden">
                {/* every moment is mounted (and loaded) up front; only the active one shows */}
                {DAY.map((d, k) => (
                  <motion.div
                    key={d.time}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: k === i ? 1 : 0, scale: k === i ? 1 : 1.12 }}
                    transition={{ duration: 1.1, ease: EASE_EXPO }}
                  >
                    <Image src={d.image.src} alt={k === i ? d.image.alt : ""} fill sizes="24rem" loading="eager" className="object-cover" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* the day as a ruler */}
        <div className="gutter absolute inset-x-0 bottom-[var(--gutter)]">
          <div className="relative h-px w-full bg-bone/25">
            <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-saffron" style={{ scaleX: fill }} />
          </div>
          <ol className="label mt-3 hidden justify-between text-bone/60 md:flex">
            {DAY.map((d, k) => (
              <li key={d.time} className={`transition-colors duration-500 ${k === i ? "text-bone" : ""}`}>
                {d.time}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
