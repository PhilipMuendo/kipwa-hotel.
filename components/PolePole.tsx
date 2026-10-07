"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import poolDusk from "@/assets/images/pool-dusk.jpg";

/*
 * POLE POLE: a breath between sections. A small arched window onto the pool
 * at dusk grows until the arch leaves the screen and the photograph is all
 * there is. One phrase: the only rule of the house.
 */
export default function PolePole() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(p, [0, 0.7], [0.42, 2.6]);
  const imgScale = useTransform(p, [0, 1], [1.5, 1]);
  const textOpacity = useTransform(p, [0.25, 0.45, 0.85, 1], [0, 1, 1, 0.6]);
  const textY = useTransform(p, [0.25, 0.6], ["8vh", "0vh"]);

  return (
    <section ref={ref} data-nav="light" aria-label="Pole pole" className="plaster relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div className="arch relative h-[100svh] w-[min(100vw,82svh)] overflow-hidden will-change-transform" style={{ scale }}>
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            <Image src={poolDusk} alt="An infinity pool at dusk, meeting the ocean" fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-ink/25" />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-bone" style={{ opacity: textOpacity, y: textY }}>
          <p className="font-serif text-[clamp(4.5rem,14vw,16rem)] italic leading-none tracking-[-0.04em] [text-shadow:0_2px_50px_rgba(12,14,15,0.3)]">Pole pole</p>
          <p className="label mt-5 text-bone/90">Slowly, slowly. The only rule of the house.</p>
        </motion.div>
      </div>
    </section>
  );
}
