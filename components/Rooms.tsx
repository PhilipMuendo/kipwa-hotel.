"use client";

import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { site, formatKES, type Room } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { useLenis, useScrollTo } from "@/lib/smooth-scroll";
import { usePrefersReducedMotion, useViewport } from "@/lib/useMedia";
import { whatsappLink } from "@/lib/whatsapp";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";
import { WhatsAppIcon } from "./Hero";

/*
 * ROOMS: a pinned horizontal walk past four arched doorways. Each arch holds
 * the room's photograph, drifting inside its frame as you pass. Open one to
 * get the full room sheet.
 */

const PANEL = 30; // vw per room on desktop
const LEAD = 38; // vw intro panel

function RoomArch({ room, i, x, vw, onOpen }: { room: Room; i: number; x: MotionValue<number>; vw: number; onOpen: () => void }) {
  const centre = ((LEAD + i * PANEL + PANEL / 2) * vw) / 100;
  const shift = useTransform(x, (v) => {
    const screen = centre + v - vw / 2;
    return `${Math.max(-12, Math.min(12, (screen / vw) * -14))}%`;
  });
  return (
    <article className="group relative flex h-full shrink-0 flex-col justify-center px-[2vw]" style={{ width: `${PANEL}vw` }} aria-labelledby={`room-${room.id}`}>
      <button type="button" onClick={onOpen} className="relative block text-left" aria-label={`View ${room.name}`}>
        <div className="arch relative h-[58svh] w-full overflow-hidden bg-sand">
          <motion.div className="absolute inset-y-0 -left-[14%] -right-[14%]" style={{ x: shift }}>
            <Image
              src={room.images[0].src}
              alt={room.images[0].alt}
              fill
              sizes="30vw"
              loading="eager"
              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]"
              placeholder="blur"
            />
          </motion.div>
          <span className="label absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-bone/90 px-3 py-1.5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            View room
          </span>
        </div>
      </button>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="label text-clay">{pad(i + 1)} · {room.view}</p>
          <h3 id={`room-${room.id}`} className="mt-2 font-serif text-[clamp(2rem,2.8vw,3rem)] leading-none tracking-[-0.02em]">
            {room.name}
          </h3>
          <p className="mt-1 font-serif text-[1.1rem] italic text-clay">{room.gloss}</p>
        </div>
        <p className="label shrink-0 pt-6 text-right">
          <span className="text-clay">From</span>
          <br />
          {formatKES(room.rate)}
        </p>
      </div>
    </article>
  );
}

function RoomSheet({ room, onClose }: { room: Room; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const { setRoomId } = useBooking();
  const [img, setImg] = useState(0);

  useEffect(() => {
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>("a,button"));
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="fixed inset-0 z-[110] overflow-y-auto bg-bone text-ink"
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      data-lenis-prevent
    >
      <div className="gutter grid min-h-full grid-cols-1 gap-8 py-6 md:grid-cols-12 md:gap-10 md:py-8">
        <div className="relative md:col-span-6">
          <div className="arch relative h-[52svh] w-full overflow-hidden md:sticky md:top-8 md:h-[calc(100svh-4rem)]">
            <AnimatePresence initial={false}>
              <motion.div key={img} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_EXPO }}>
                <Image src={room.images[img].src} alt={room.images[img].alt} fill sizes="50vw" className="object-cover" placeholder="blur" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col md:col-span-6 md:py-6">
          <div className="flex items-center justify-between">
            <p className="label text-clay">{site.name} · Rooms</p>
            <button type="button" onClick={onClose} className="label inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 hover:border-ink">
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>
          <h2 id="sheet-title" className="d-xl mt-10">
            {room.name}
          </h2>
          <p className="mt-3 font-serif text-[1.6rem] italic text-clay">&ldquo;{room.gloss}&rdquo;</p>
          <p className="lead mt-8 max-w-[40ch] text-ink/80">{room.line}</p>

          <dl className="mt-10 grid grid-cols-2 border-t border-ink/15 md:grid-cols-4">
            {[
              ["Size", room.size],
              ["Guests", `Up to ${room.guests}`],
              ["View", room.view],
              ["Bed", room.bed],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-ink/15 py-4 pr-4">
                <dt className="label text-clay">{k}</dt>
                <dd className="mt-1.5 text-[0.95rem]">{v}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {room.amenities.map((a) => (
              <li key={a} className="flex items-center gap-3 text-[0.95rem]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-saffron" />
                {a}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-2" role="group" aria-label="Photos">
            {room.images.map((im, k) => (
              <button
                key={k}
                type="button"
                onClick={() => setImg(k)}
                aria-label={`Photo ${k + 1}: ${im.alt}`}
                aria-pressed={img === k}
                className={`relative h-16 w-24 overflow-hidden transition-opacity ${img === k ? "opacity-100 ring-2 ring-saffron ring-offset-2 ring-offset-bone" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={im.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-14">
            <p>
              <span className="label text-clay">From, per night, B&amp;B{site.ratesPlaceholder ? " · indicative" : ""}</span>
              <br />
              <span className="font-serif text-[2.4rem] leading-none">{formatKES(room.rate)}</span>
            </p>
            <div className="flex gap-2">
              <a
                href={whatsappLink(`Hello ${site.name}, I'm interested in the ${room.name}. Could you share availability?`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/25 px-5 text-[0.85rem] hover:border-ink"
              >
                <WhatsAppIcon className="h-4 w-4" /> Ask
              </a>
              <button
                type="button"
                onClick={() => {
                  setRoomId(room.id);
                  onClose();
                  window.setTimeout(() => scrollTo("#book"), 500);
                }}
                className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[0.85rem] text-bone transition-colors hover:bg-saffron hover:text-ink"
              >
                Book this room
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Rooms() {
  const ref = useRef<HTMLElement>(null);
  const vp = useViewport();
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState<Room | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const vw = vp?.w ?? 1440;
  const vh = vp?.h ?? 900;
  const desktop = (vp?.w ?? 1440) >= 768 && !reduce;
  const track = ((LEAD + site.rooms.length * PANEL + 8) * vw) / 100;
  const travel = Math.max(0, track - vw);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(p, (v) => -v * travel);
  const bar = useTransform(p, [0, 1], [0, 1]);

  const header = (
    <div className="max-w-[26rem]">
      <p className="label text-clay">(02) Rooms &amp; suites</p>
      <RevealLines as="h2" className="d-lg mt-6" lines={["Rooms that", <>open to the <em key="s">sea</em></>]} />
      <p className="lead mt-6 text-ink/75">Four ways to wake up on the coast. Lime-washed walls, carved beds, shutters that fold back to the Indian Ocean.</p>
      <p className="label mt-6 text-clay">Rates per night, bed &amp; breakfast{site.ratesPlaceholder ? " · indicative" : ""}</p>
    </div>
  );

  return (
    <>
      {desktop ? (
        <section ref={ref} id="rooms" data-nav="light" aria-label="Rooms and suites" className="relative bg-sand" style={{ height: travel * 0.9 + vh }}>
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
            <motion.div className="flex h-full items-center will-change-transform" style={{ x, width: track }}>
              <div className="gutter flex h-full shrink-0 flex-col justify-center" style={{ width: `${LEAD}vw` }}>
                {header}
              </div>
              {site.rooms.map((r, i) => (
                <RoomArch key={r.id} room={r} i={i} x={x} vw={vw} onOpen={() => setOpen(r)} />
              ))}
            </motion.div>
            <div className="gutter absolute inset-x-0 bottom-[var(--gutter)] flex items-center gap-4">
              <span className="label text-clay">Scroll</span>
              <div className="h-px flex-1 bg-ink/15">
                <motion.div className="h-px origin-left bg-ink" style={{ scaleX: bar }} />
              </div>
              <span className="label text-clay">{pad(site.rooms.length)} rooms</span>
            </div>
          </div>
        </section>
      ) : (
        <section id="rooms" data-nav="light" aria-label="Rooms and suites" className="bg-sand py-[12vh]">
          <div className="gutter">{header}</div>
          <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4">
            {site.rooms.map((r, i) => (
              <li key={r.id} className="w-[78vw] shrink-0 snap-center">
                <button type="button" onClick={() => setOpen(r)} className="block w-full text-left" aria-label={`View ${r.name}`}>
                  <div className="arch relative aspect-[3/4] w-full overflow-hidden">
                    <Image src={r.images[0].src} alt={r.images[0].alt} fill sizes="78vw" className="object-cover" placeholder="blur" />
                  </div>
                  <p className="label mt-4 text-clay">{pad(i + 1)} · {r.view}</p>
                  <h3 className="mt-1 font-serif text-[2.2rem] leading-none">{r.name}</h3>
                  <p className="mt-2 flex justify-between text-[0.9rem]">
                    <em className="font-serif text-clay">{r.gloss}</em>
                    <span className="label">{formatKES(r.rate)}</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <AnimatePresence>{open && <RoomSheet room={open} onClose={close} />}</AnimatePresence>
    </>
  );
}
