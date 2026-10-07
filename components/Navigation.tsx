"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useLenis, useScrollTo } from "@/lib/smooth-scroll";
import { mombasaTime, whatsappLink, helloMessage } from "@/lib/whatsapp";
import { EASE_EXPO, pad } from "@/lib/utils";
import ArchMark from "./ui/ArchMark";
import menuImage from "@/assets/images/carved-door.jpg";

/**
 * Header that reads the theme of whatever section is under it
 * (`data-nav="light" | "dark"`), shows Mombasa's live time, and opens a
 * full-screen menu. Book is always one tap away.
 */
export default function Navigation() {
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [time, setTime] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 80));

  useEffect(() => {
    const tick = () => setTime(mombasaTime());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  // theme follows the section beneath the header
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setTheme((e.target as HTMLElement).dataset.nav === "dark" ? "dark" : "light"));
      },
      { rootMargin: "0px 0px -96% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"));
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
      trigger.current?.focus();
    };
  }, [open, lenis]);

  const go = (href: string) => {
    const wasOpen = open;
    setOpen(false);
    window.setTimeout(() => scrollTo(href), wasOpen ? 450 : 0);
  };

  const dark = theme === "dark" && !open;
  const fg = dark ? "text-bone" : "text-ink";

  return (
    <>
      <a href="#rooms" className="fixed left-4 top-4 z-[120] -translate-y-24 bg-ink px-4 py-2 text-bone focus:translate-y-0">
        Skip to content
      </a>
      <header className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-700 ${fg}`}>
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-700 ${compact && !open ? "opacity-100" : "opacity-0"} ${
            dark ? "bg-gradient-to-b from-ink/55 to-transparent" : "bg-gradient-to-b from-bone/85 to-transparent"
          }`}
        />
        <div className="gutter flex h-[4.75rem] items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="flex items-center gap-2.5"
            aria-label={`${site.name}, back to top`}
          >
            <ArchMark className="h-6 w-auto" />
            <span className="font-serif text-[1.7rem] leading-none tracking-[-0.02em]">{site.name}</span>
          </a>

          <p className="label hidden items-center gap-3 lg:flex" aria-live="off">
            <span className="opacity-60">Mombasa</span>
            <span className="tabular-nums">{time ?? "--:--"}</span>
            <span className="opacity-60">EAT</span>
          </p>

          <div className="flex items-center gap-5 md:gap-7">
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex gap-6 text-[0.8rem]">
                {site.nav.map((n) => (
                  <li key={n.href}>
                    <a
                      href={n.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(n.href);
                      }}
                      className="group relative py-2"
                    >
                      {n.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-expo)] group-hover:origin-left group-hover:scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              ref={trigger}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 text-[0.8rem] md:hidden"
            >
              {open ? "Close" : "Menu"}
              <span aria-hidden="true" className="relative block h-2 w-5">
                <motion.span className="absolute left-0 top-0 h-px w-full bg-current" animate={{ y: open ? 4 : 0, rotate: open ? 45 : 0 }} />
                <motion.span className="absolute bottom-0 left-0 h-px w-full bg-current" animate={{ y: open ? -3.5 : 0, rotate: open ? -45 : 0 }} />
              </span>
            </button>
            <a
              href="#book"
              onClick={(e) => {
                e.preventDefault();
                go("#book");
              }}
              className="group relative inline-flex h-10 items-center overflow-hidden rounded-full bg-saffron px-5 text-[0.8rem] font-medium text-ink"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
              <span className="relative transition-colors duration-500 group-hover:text-bone">Book</span>
            </a>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="plaster fixed inset-0 z-[95] flex flex-col text-ink"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="h-[4.75rem]" />
            <div className="gutter flex flex-1 items-center gap-10">
              <nav aria-label="Menu" className="flex-1">
                <ul>
                  {[...site.nav, { label: "Book your stay", href: "#book" }].map((n, i) => (
                    <li key={n.href} className="overflow-hidden">
                      <motion.a
                        href={n.href}
                        onClick={(e) => {
                          e.preventDefault();
                          go(n.href);
                        }}
                        className="group flex items-baseline gap-4 py-1"
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.25 + i * 0.05 }}
                      >
                        <span className="label w-6 text-clay">{pad(i + 1)}</span>
                        <span className="font-serif text-[clamp(2.6rem,min(9vw,9svh),6.5rem)] leading-[1] tracking-[-0.03em] transition-[font-style,transform] duration-500 group-hover:translate-x-2 group-hover:italic">
                          {n.label}
                        </span>
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </nav>
              <motion.div
                className="arch relative hidden aspect-[3/4] h-[62svh] overflow-hidden md:block"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: EASE_EXPO, delay: 0.3 }}
              >
                <Image src={menuImage} alt="A carved Swahili door" fill sizes="30vw" className="object-cover" />
              </motion.div>
            </div>
            <div className="gutter label flex flex-wrap justify-between gap-4 pb-[var(--gutter)] pt-6 text-clay">
              <a className="hover:text-ink" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer">
                WhatsApp {site.contact.phone}
              </a>
              <a className="hover:text-ink" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              <span>{site.contact.coordinates}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
