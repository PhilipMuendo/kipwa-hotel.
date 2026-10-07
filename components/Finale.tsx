"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import OceanCanvas from "./OceanCanvas";
import { useScrollTo } from "@/lib/smooth-scroll";
import { RevealLines } from "./ui/Reveal";
import moonSea from "@/assets/images/moon-sea.jpg";

/*
 * LALA SALAMA: the page ends where the day does. The same live ocean as the
 * hero, now under a rising moon, wishing you goodnight.
 */
export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const hour = useTransform(scrollYProgress, [0, 1], [0.86, 0.97]);

  return (
    <section ref={ref} id="goodnight" data-nav="dark" aria-labelledby="final-title" className="relative h-[100svh] overflow-hidden bg-ink text-bone">
      <OceanCanvas hour={hour} horizon={0.36} fallback={moonSea} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/40" />
      <div className="gutter relative flex h-full flex-col items-center justify-center text-center">
        <RevealLines
          as="h2"
          className="font-serif italic"
          lineClassName="text-[clamp(4.5rem,15vw,17rem)] leading-[0.9] tracking-[-0.04em]"
          lines={["Lala salama"]}
        />
        <span id="final-title" className="sr-only">
          Lala salama: sleep well
        </span>
        <p className="label mt-6 text-bone/80">Sleep well. The tide will be back at dawn.</p>
        <motion.a
          href="#book"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#book");
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="group relative mt-10 inline-flex h-14 items-center overflow-hidden rounded-full bg-bone px-8 text-[0.95rem] text-ink"
        >
          <span className="absolute inset-0 translate-y-full rounded-full bg-saffron transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
          <span className="relative">Check availability</span>
        </motion.a>
      </div>
    </section>
  );
}
