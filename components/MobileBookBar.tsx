"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useScrollTo } from "@/lib/smooth-scroll";
import { whatsappLink, helloMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Hero";

/** Phones only: a booking bar that appears after the hero and hides near the booking form. */
export default function MobileBookBar() {
  const scrollTo = useScrollTo();
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);
  const [nearBook, setNearBook] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setPast(v > window.innerHeight * 1.2));
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNearBook(e.isIntersecting), { rootMargin: "0px 0px 20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = past && !nearBook;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-[80] flex gap-2 rounded-full bg-ink/90 p-1.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur md:hidden"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <a
            href={whatsappLink(helloMessage)}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[0.85rem] text-bone"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href="#book"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#book");
            }}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-saffron text-[0.85rem] font-medium text-ink"
          >
            Check availability
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
