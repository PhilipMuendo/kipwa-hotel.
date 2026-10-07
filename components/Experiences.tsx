"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { site } from "@/config/site";
import { useFinePointer } from "@/lib/useMedia";
import { whatsappLink } from "@/lib/whatsapp";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * EXPERIENCES: five tall slices of the coast side by side. The one you point
 * at (or focus) opens wide and tells its story; the others narrow to a sliver
 * with their name set vertically. On touch, slices stack and open on tap.
 */

export default function Experiences() {
  const fine = useFinePointer();
  const [active, setActive] = useState(0);
  const xs = site.experiences;

  return (
    <section id="experiences" data-nav="dark" aria-labelledby="exp-title" className="bg-ink py-[14vh] text-bone">
      <div className="gutter grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label text-bone/60">(05) Beyond the house</p>
          <RevealLines as="h2" className="d-lg mt-6" lines={["The coast,", <>at <em key="t">tide</em> pace</>]} />
          <span id="exp-title" className="sr-only">
            Experiences: the coast at tide pace
          </span>
        </div>
        <p className="lead self-end text-bone/70 md:col-span-4 md:col-start-9">
          Everything is arranged by the house and timed to the water: low tide for the reef and the sandbank, high tide for the dhow.
        </p>
      </div>

      {/* desktop: expanding slices */}
      <div className="gutter mt-[8vh] hidden h-[74svh] gap-2 md:flex">
        {xs.map((x, i) => {
          const on = i === active;
          return (
            <motion.article
              key={x.id}
              tabIndex={0}
              aria-labelledby={`exp-h-${x.id}`}
              onPointerEnter={() => fine && setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group relative h-full cursor-pointer overflow-hidden rounded-[2px] text-left outline-offset-4"
              animate={{ flexGrow: on ? 5.2 : 1 }}
              transition={{ duration: 0.9, ease: EASE_EXPO }}
              style={{ flexBasis: 0 }}
            >
              <motion.div className="absolute inset-0" animate={{ scale: on ? 1 : 1.18 }} transition={{ duration: 1.2, ease: EASE_EXPO }}>
                <Image src={x.image.src} alt={x.image.alt} fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover" />
              </motion.div>
              <div className={`absolute inset-0 transition-colors duration-700 ${on ? "bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" : "bg-ink/45 group-hover:bg-ink/30"}`} />

              {/* collapsed: vertical name */}
              {!on && <span id={`exp-h-${x.id}`} className="sr-only">{x.name}</span>}
              <motion.span
                aria-hidden="true"
                className="absolute bottom-6 left-1/2 origin-bottom-left whitespace-nowrap font-serif text-[1.6rem] italic"
                style={{ rotate: -90, x: "0.6em" }}
                animate={{ opacity: on ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              >
                {x.name}
              </motion.span>
              <span className="label absolute left-4 top-4 text-bone/70">{pad(i + 1)}</span>

              {/* expanded: the story */}
              <AnimatePresence>
                {on && (
                  <motion.div
                    id={`exp-${x.id}`}
                    className="absolute inset-x-0 bottom-0 p-7"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_EXPO, delay: 0.25 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    <p className="font-serif text-[1.2rem] italic text-saffron">{x.gloss}</p>
                    <h3 id={`exp-h-${x.id}`} className="mt-1 font-serif text-[clamp(2.4rem,4vw,4.4rem)] leading-none tracking-[-0.02em]">{x.name}</h3>
                    <div className="mt-4 flex items-end justify-between gap-6">
                      <p className="max-w-[36ch] text-[0.98rem] leading-relaxed text-bone/85">{x.body}</p>
                      <p className="label shrink-0 text-bone/70">{x.duration}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>

      {/* touch: stacked, tap to open */}
      <ul className="gutter mt-10 space-y-2 md:hidden">
        {xs.map((x, i) => {
          const on = i === active;
          return (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setActive(on ? -1 : i)}
                aria-expanded={on}
                className="relative block w-full overflow-hidden text-left"
              >
                <motion.span className="relative block" animate={{ height: on ? "62svh" : "6.5rem" }} transition={{ duration: 0.8, ease: EASE_EXPO }}>
                  <Image src={x.image.src} alt={x.image.alt} fill sizes="100vw" className="object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/20" />
                  <span className="absolute inset-x-0 bottom-0 block p-5">
                    <span className="flex items-baseline justify-between">
                      <span className="font-serif text-[2rem] leading-none">{x.name}</span>
                      <span className="label text-bone/70">{x.duration}</span>
                    </span>
                    <AnimatePresence>
                      {on && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 block text-[0.95rem] leading-relaxed text-bone/85">
                          <em className="font-serif text-saffron">{x.gloss}</em> · {x.body}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="gutter mt-10 flex justify-end">
        <a
          href={whatsappLink(`Hello ${site.name}, could you help me plan some experiences during my stay?`)}
          target="_blank"
          rel="noreferrer"
          className="label inline-flex items-center gap-3 border-b border-bone/40 pb-1 transition-colors hover:border-saffron hover:text-saffron"
        >
          Plan your days with the house on WhatsApp →
        </a>
      </div>
    </section>
  );
}
