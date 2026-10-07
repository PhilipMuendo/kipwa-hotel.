"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site, formatKES, type Dish } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * DINING: a plate seen from above stays pinned while the menu scrolls past;
 * each dish turns the plate to its own photograph. Dish names are in Kiswahili
 * first, the way the kitchen says them.
 */

function DishRow({ dish, i, active, onActive }: { dish: Dish; i: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);

  return (
    <li ref={ref} className="border-t border-ink/15 py-10 md:py-14">
      {/* mobile plate */}
      <div className="relative mb-6 aspect-square w-[62vw] overflow-hidden rounded-full md:hidden">
        <Image src={dish.image.src} alt={dish.image.alt} fill sizes="62vw" className="object-cover" />
      </div>
      <motion.div animate={{ opacity: active ? 1 : 0.32 }} transition={{ duration: 0.6, ease: EASE_EXPO }} className="md:opacity-100">
        <div className="flex items-baseline justify-between gap-6">
          <p className="label text-clay">{pad(i + 1)}</p>
          <p className="label tabular-nums">{formatKES(dish.price)}</p>
        </div>
        <h3 className="mt-3 font-serif text-[clamp(2.4rem,4.4vw,5rem)] leading-[0.95] tracking-[-0.025em]">{dish.name}</h3>
        <p className="mt-2 font-serif text-[1.35rem] italic text-clay">{dish.english}</p>
        <p className="mt-4 max-w-[42ch] text-[1rem] leading-relaxed text-ink/80">{dish.body}</p>
      </motion.div>
    </li>
  );
}

export default function Dining() {
  const [active, setActive] = useState(0);
  const dishes = site.dining;

  return (
    <section id="dining" data-nav="light" aria-labelledby="dining-title" className="plaster relative py-[16vh]">
      <div className="gutter grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-6">
          <p className="label text-clay">(04) Dining</p>
          <RevealLines as="h2" className="d-lg mt-6" lines={["The kitchen", <>of the <em key="c">coast</em></>]} />
          <span id="dining-title" className="sr-only">
            Dining: the kitchen of the coast
          </span>
        </div>
        <p className="lead self-end text-ink/75 md:col-span-4 md:col-start-9">
          Whatever the boats bring in at dawn, cooked over coconut husk by evening. Coconut, tamarind, lime and the spice route in every pot.
        </p>
      </div>

      <div className="gutter mt-[10vh] grid grid-cols-1 md:grid-cols-12 md:gap-6">
        {/* the plate */}
        <div className="hidden md:col-span-5 md:block">
          <div className="sticky top-[14vh] flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[34rem]">
              <div className="absolute inset-0 rounded-full border border-ink/10" />
              <div className="absolute inset-[4%] overflow-hidden rounded-full bg-sand shadow-[0_40px_80px_-40px_rgba(12,14,15,0.45)]">
                {dishes.map((d, k) => (
                  <motion.div
                    key={d.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: k === active ? 1 : 0, rotate: k === active ? 0 : -24, scale: k === active ? 1 : 1.15 }}
                    transition={{ duration: 1.2, ease: EASE_EXPO }}
                  >
                    <Image src={d.image.src} alt={k === active ? d.image.alt : ""} fill sizes="34rem" loading="eager" className="object-cover" />
                  </motion.div>
                ))}
              </div>
              {/* rim ticks: one per dish */}
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                {dishes.map((_, k) => {
                  const a = ((k / dishes.length) * 360 - 90) * (Math.PI / 180);
                  const on = k === active;
                  return (
                    <circle
                      key={k}
                      cx={Math.round((50 + Math.cos(a) * 49.5) * 100) / 100}
                      cy={Math.round((50 + Math.sin(a) * 49.5) * 100) / 100}
                      r={on ? 1.1 : 0.6}
                      className={on ? "fill-saffron" : "fill-clay"}
                    />
                  );
                })}
              </svg>
            </div>
            <p className="label mt-6 text-clay">
              {pad(active + 1)} / {pad(dishes.length)} · {dishes[active].english}
            </p>
          </div>
        </div>

        <ol className="md:col-span-6 md:col-start-7">
          {dishes.map((d, k) => (
            <DishRow key={d.id} dish={d} i={k} active={k === active} onActive={setActive} />
          ))}
          <li aria-hidden="true" className="border-t border-ink/15" />
        </ol>
      </div>
      {site.diningPlaceholder && <p className="gutter label mt-8 text-clay">Menu and prices are indicative placeholders.</p>}
    </section>
  );
}
