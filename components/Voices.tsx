"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { EASE_EXPO, pad } from "@/lib/utils";

/** GUEST WORDS: one sentence at a time, set large. Pauses on hover/focus. */
export default function Voices() {
  const reduce = usePrefersReducedMotion();
  const list = site.testimonials;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % list.length), 7000);
    return () => window.clearTimeout(id);
  }, [i, paused, reduce, list.length]);

  const t = list[i];
  return (
    <section
      data-nav="light"
      aria-labelledby="voices-title"
      aria-roledescription="carousel"
      className="bg-sand py-[16vh]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="gutter">
        <div className="flex items-center justify-between">
          <h2 id="voices-title" className="label text-clay">
            (06) Guest words
          </h2>
          {list.some((x) => x.placeholder) && <p className="label text-clay">Placeholder reviews</p>}
        </div>

        <figure className="mt-[8vh] min-h-[22rem] md:min-h-[26rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8, ease: EASE_EXPO }}>
              <blockquote className="max-w-[22ch] font-serif text-[clamp(2.3rem,5.4vw,6.2rem)] leading-[1] tracking-[-0.03em]">
                <span className="text-saffron">&ldquo;</span>
                {t.quote}
                <span className="text-saffron">&rdquo;</span>
              </blockquote>
              <figcaption className="label mt-8 text-clay">
                {t.name} · {t.origin}
              </figcaption>
            </motion.div>
          </AnimatePresence>
        </figure>

        <div className="mt-10 flex items-center gap-6">
          <div className="flex gap-2">
            <button type="button" aria-label="Previous review" onClick={() => setI((v) => (v - 1 + list.length) % list.length)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 hover:border-ink">
              ←
            </button>
            <button type="button" aria-label="Next review" onClick={() => setI((v) => (v + 1) % list.length)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 hover:border-ink">
              →
            </button>
          </div>
          <div className="flex flex-1 gap-2" aria-hidden="true">
            {list.map((_, k) => (
              <span key={k} className="relative h-px flex-1 bg-ink/15">
                {k === i && (
                  <motion.span
                    key={`${i}-${paused}`}
                    className="absolute inset-0 origin-left bg-ink"
                    initial={{ scaleX: reduce || paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduce || paused ? 0 : 7, ease: "linear" }}
                  />
                )}
                {k < i && <span className="absolute inset-0 bg-ink/50" />}
              </span>
            ))}
          </div>
          <p className="label tabular-nums text-clay">
            {pad(i + 1)} / {pad(list.length)}
          </p>
        </div>
      </div>
    </section>
  );
}
