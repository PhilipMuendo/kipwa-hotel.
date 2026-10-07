"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { site } from "@/config/site";
import { RevealLines, FadeIn } from "./ui/Reveal";
import tideFlats from "@/assets/images/tide-flats.jpg";
import lowTideBoat from "@/assets/images/low-tide-boat.jpg";

/*
 * KARIBU: slides up over the hero with an arched crown, then a manifesto that
 * surfaces word by word as you read it, like the sand appearing as the tide goes out.
 */

const MANIFESTO: { t: string; em?: boolean }[] = [
  { t: "Kipwa", em: true },
  { t: "is" }, { t: "the" }, { t: "Swahili" }, { t: "word" }, { t: "for" }, { t: "the" }, { t: "shore" }, { t: "the" }, { t: "sea" },
  { t: "gives" }, { t: "back" }, { t: "at" }, { t: "low", em: true }, { t: "tide:", em: true }, { t: "warm" }, { t: "pools," }, { t: "ribbed" },
  { t: "sand," }, { t: "the" }, { t: "hour" }, { t: "when" }, { t: "everything" }, { t: "slows." }, { t: "We" }, { t: "built" }, { t: "a" },
  { t: "house" }, { t: "around" }, { t: "that" }, { t: "hour." },
];

function Word({ w, i, n, p }: { w: { t: string; em?: boolean }; i: number; n: number; p: MotionValue<number> }) {
  const start = i / n;
  const opacity = useTransform(p, [start - 0.05, start + 0.04], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={w.em ? "italic text-saffron" : undefined}>
      {w.t}{" "}
    </motion.span>
  );
}

export default function Intro() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.45"] });
  const { scrollYProgress: ip } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(ip, [0, 1], ["-8%", "8%"]);
  const smallY = useTransform(ip, [0, 1], ["30%", "-30%"]);

  return (
    <section id="intro" data-nav="light" aria-labelledby="intro-title" className="relative z-10 -mt-[100svh]">
      {/* arched crown */}
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="block h-[22vw] min-h-28 w-full" aria-hidden="true">
        <path d="M0,30 L0,22 C0,12 22,3.5 50,0 C78,3.5 100,12 100,22 L100,30 Z" fill="#F3EDE3" />
      </svg>
      <div className="plaster -mt-px pb-[16vh]">
        <div className="gutter">
          <div className="label flex justify-between text-clay">
            <span id="intro-title">(01) Karibu</span>
            <span>Welcome to the coast</span>
          </div>

          <p ref={textRef} className="d-lg mt-[8vh] max-w-[17ch] md:max-w-[19ch]">
            {MANIFESTO.map((w, i) => (
              <Word key={i} w={w} i={i} n={MANIFESTO.length} p={scrollYProgress} />
            ))}
          </p>
        </div>

        <div className="gutter mt-[14vh] grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col justify-between md:col-span-5">
            <dl className="grid grid-cols-3 gap-4 border-t border-ink/15 pt-6">
              {site.facts.map((f) => (
                <div key={f.label} className="flex flex-col">
                  <dt className="label order-2 mt-2 text-clay">
                    {f.label}
                    {"placeholder" in f && f.placeholder ? "*" : ""}
                  </dt>
                  <dd className="order-1 font-serif text-[clamp(3.25rem,6vw,6.5rem)] leading-none tracking-[-0.04em]">{f.value}</dd>
                </div>
              ))}
            </dl>
            <FadeIn className="mt-12 md:mt-0">
              <p className="lead max-w-[36ch] text-ink/80">
                No lobby, no queue, no wristbands. Twenty-four rooms in coral stone and lime, a kitchen that cooks what the boats bring in, and a reef you can swim to at low tide.
              </p>
              <p className="label mt-6 text-clay">* Room count is a placeholder</p>
            </FadeIn>
          </div>

          <div ref={imgRef} className="relative md:col-span-6 md:col-start-7">
            <div className="arch relative aspect-[4/5] w-full overflow-hidden">
              <motion.div className="absolute inset-[-10%]" style={{ y: imgY }}>
                <Image src={tideFlats} alt="A dhow at sunset beyond tide flats uncovered at low tide" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" placeholder="blur" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -bottom-10 -left-6 hidden aspect-square w-[34%] overflow-hidden border-[10px] border-bone shadow-[0_30px_60px_-30px_rgba(12,14,15,0.35)] md:block"
              style={{ y: smallY }}
            >
              <Image src={lowTideBoat} alt="A fishing boat resting on ribbed sand at low tide" fill sizes="20vw" className="object-cover" placeholder="blur" />
            </motion.div>
            <RevealLines
              as="p"
              className="label mt-5 text-right text-clay"
              lines={["Fig. The kipwa, an hour after low tide"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
