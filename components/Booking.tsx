"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { site, formatKES } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { whatsappLink } from "@/lib/whatsapp";
import { EASE_EXPO } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";
import { WhatsAppIcon } from "./Hero";

/*
 * BOOKING: a calm, direct-booking request. Pick dates on a two-month
 * calendar, guests and a room; see the nights and an indicative total in KES;
 * then send it the way people on the coast actually book: a prefilled
 * WhatsApp message, or an email request to the front desk.
 */

const DAY_MS = 86_400_000;
const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const same = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const long = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function Month({
  month,
  today,
  start,
  end,
  hover,
  onPick,
  onHover,
}: {
  month: Date;
  today: Date;
  start: Date | null;
  end: Date | null;
  hover: Date | null;
  onPick: (d: Date) => void;
  onHover: (d: Date | null) => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const rangeEnd = end ?? (start && hover && hover > start ? hover : null);

  return (
    <div>
      <p className="font-serif text-[1.6rem] leading-none">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
      <div className="label mt-5 grid grid-cols-7 text-center text-clay" aria-hidden="true">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1" role="group" aria-label={month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}>
        {Array.from({ length: lead }).map((_, k) => (
          <span key={`b${k}`} />
        ))}
        {Array.from({ length: days }).map((_, k) => {
          const d = new Date(month.getFullYear(), month.getMonth(), k + 1);
          const past = d < today;
          const isStart = same(d, start);
          const isEnd = same(d, end);
          const inRange = !!start && !!rangeEnd && d > start && d < rangeEnd;
          const edge = isStart || isEnd || (same(d, rangeEnd) && !end);
          return (
            <div key={k} className={`relative flex justify-center ${inRange ? "bg-saffron/20" : ""} ${isStart && rangeEnd ? "bg-gradient-to-r from-transparent from-50% to-saffron/20 to-50%" : ""} ${(isEnd || (same(d, rangeEnd) && !end)) && start ? "bg-gradient-to-l from-transparent from-50% to-saffron/20 to-50%" : ""}`}>
              <button
                type="button"
                data-date={iso(d)}
                disabled={past}
                onClick={() => onPick(d)}
                onPointerEnter={() => onHover(d)}
                onFocus={() => onHover(d)}
                aria-label={`${long(d)}${isStart ? ", check-in" : ""}${isEnd ? ", check-out" : ""}`}
                aria-pressed={isStart || isEnd}
                className={`relative grid h-10 w-10 place-items-center rounded-full text-[0.9rem] tabular-nums transition-colors md:h-11 md:w-11 ${
                  past ? "cursor-not-allowed text-ink/25" : edge ? "bg-ink text-bone" : "hover:bg-ink/10"
                } ${same(d, today) && !edge ? "underline decoration-saffron decoration-2 underline-offset-4" : ""}`}
              >
                {k + 1}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/15 py-3">
      <span className="text-[0.95rem]">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/25 disabled:opacity-30">
          −
        </button>
        <span className="w-5 text-center tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/25 disabled:opacity-30">
          +
        </button>
      </div>
    </div>
  );
}

export default function Booking() {
  const { roomId, setRoomId } = useBooking();
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<Date | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const gridRef = useRef<HTMLDivElement>(null);

  // dates depend on the visitor's clock: compute them on the client only
  useEffect(() => {
    const t = startOfDay(new Date());
    setToday(t);
    setView(new Date(t.getFullYear(), t.getMonth(), 1));
  }, []);

  const room = site.rooms.find((r) => r.id === roomId) ?? site.rooms[1];
  const nights = start && end ? Math.round((end.getTime() - start.getTime()) / DAY_MS) : 0;
  const total = nights * room.rate;
  const guests = adults + children;
  const tooMany = guests > room.guests;

  const pick = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (d <= start) {
      setStart(d);
    } else {
      setEnd(d);
    }
  };

  // arrow keys move between days
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = document.activeElement as HTMLElement | null;
    const cur = el?.dataset.date;
    if (!cur) return;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const [y, m, d] = cur.split("-").map(Number);
    const next = new Date(y, m - 1, d + delta);
    let target = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${iso(next)}"]`);
    if (!target && view) {
      setView(addMonths(view, delta > 0 ? 1 : -1));
      window.setTimeout(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${iso(next)}"]`)?.focus(), 30);
      return;
    }
    target?.focus();
  };

  const summary = useMemo(() => {
    if (!start || !end) return null;
    const lines = [
      `Hello ${site.name}, I'd like to book a stay:`,
      `• Room: ${room.name}`,
      `• Check-in: ${long(start)}`,
      `• Check-out: ${long(end)} (${nights} night${nights === 1 ? "" : "s"})`,
      `• Guests: ${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}`,
    ];
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    lines.push("Is this available?");
    return lines.join("\n");
  }, [start, end, room, nights, adults, children, name]);

  const sendEmail = async () => {
    setTouched(true);
    if (!start || !end || name.trim().length < 2 || !emailOk(email)) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: room.id, checkIn: iso(start), checkOut: iso(end), adults, children, name, email, phone, website }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const ready = !!start && !!end;

  return (
    <section id="book" data-nav="light" aria-labelledby="book-title" className="bg-sand py-[16vh]">
      <div className="gutter grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <p className="label text-clay">(08) Book direct</p>
          <RevealLines as="h2" className="d-lg mt-6" lines={["Your dates", <>on the <em key="c">coast</em></>]} />
          <span id="book-title" className="sr-only">
            Book your stay
          </span>
          <p className="lead mt-8 max-w-[34ch] text-ink/75">
            Book direct for our best rate and a welcome madafu. {site.booking.note}
          </p>
          <ul className="label mt-8 space-y-2 text-clay">
            <li>Check-in from {site.contact.checkIn} · Check-out by {site.contact.checkOut}</li>
            <li>M-Pesa, card or bank transfer</li>
            <li>Free cancellation up to 7 days before arrival*</li>
          </ul>
          <p className="label mt-4 text-clay/80">* Policy shown is a placeholder.</p>
        </div>

        <div className="rounded-[4px] bg-bone p-5 shadow-[0_50px_100px_-60px_rgba(12,14,15,0.4)] md:p-8 lg:col-span-8">
          {/* calendar */}
          <div className="flex items-center justify-between">
            <p className="label text-clay" aria-live="polite">
              {!start ? "Select check-in" : !end ? "Select check-out" : `${nights} night${nights === 1 ? "" : "s"} · ${long(start)} → ${long(end)}`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!view || !today || (view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth())}
                onClick={() => view && setView(addMonths(view, -1))}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 hover:border-ink disabled:opacity-30"
              >
                ←
              </button>
              <button type="button" aria-label="Next month" onClick={() => view && setView(addMonths(view, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 hover:border-ink">
                →
              </button>
            </div>
          </div>
          <div ref={gridRef} onKeyDown={onGridKey} onPointerLeave={() => setHover(null)} className="mt-6 grid min-h-[22rem] grid-cols-1 gap-10 md:grid-cols-2">
            {today && view ? (
              <>
                <Month month={view} today={today} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} />
                <div className="hidden md:block">
                  <Month month={addMonths(view, 1)} today={today} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} />
                </div>
              </>
            ) : (
              <div className="col-span-2 animate-pulse rounded bg-sand/60" />
            )}
          </div>

          {/* guests + room */}
          <div className="mt-8 grid grid-cols-1 gap-8 border-t border-ink/15 pt-6 md:grid-cols-2">
            <div>
              <p className="label text-clay">Guests</p>
              <Stepper label="Adults" value={adults} min={1} max={site.booking.maxGuests} onChange={setAdults} />
              <Stepper label="Children" value={children} min={0} max={4} onChange={setChildren} />
            </div>
            <fieldset>
              <legend className="label text-clay">Room</legend>
              <div className="mt-1">
                {site.rooms.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center justify-between gap-4 border-b border-ink/15 py-3">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="room" value={r.id} checked={room.id === r.id} onChange={() => setRoomId(r.id)} className="peer sr-only" />
                      <span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded-full border ${room.id === r.id ? "border-ink" : "border-ink/30"} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-saffron`}>
                        {room.id === r.id && <span className="h-2 w-2 rounded-full bg-ink" />}
                      </span>
                      <span className="text-[0.95rem]">{r.name}</span>
                    </span>
                    <span className="label text-clay">{formatKES(r.rate)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* summary + contact */}
          <div className="mt-8 border-t border-ink/15 pt-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="label text-clay">Indicative total · {room.name}</p>
                <p className="mt-2 font-serif text-[clamp(2.4rem,4vw,3.6rem)] leading-none tabular-nums">{ready ? formatKES(total) : "—"}</p>
              </div>
              <p className="label text-clay md:text-right">
                {ready ? `${nights} × ${formatKES(room.rate)} · B&B` : "Choose your dates to see a total"}
                {tooMany && <span className="mt-1 block text-saffron">{guests} guests: we&apos;ll suggest a second room</span>}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded bg-sand/60 p-6" role="status">
                  <p className="font-serif text-[2rem] leading-none">Asante sana{name ? `, ${name.split(" ")[0]}` : ""}.</p>
                  <p className="mt-3 text-ink/75">Your request is with the front desk. We&apos;ll confirm availability and the final price by email.</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={false} exit={{ opacity: 0 }} className="mt-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
                    {[
                      { id: "bk-name", label: "Your name", value: name, set: setName, type: "text", auto: "name", err: touched && name.trim().length < 2 ? "Please add your name" : "" },
                      { id: "bk-email", label: "Email", value: email, set: setEmail, type: "email", auto: "email", err: touched && !emailOk(email) ? "Enter a valid email" : "" },
                      { id: "bk-phone", label: "Phone (optional)", value: phone, set: setPhone, type: "tel", auto: "tel", err: "" },
                    ].map((f) => (
                      <div key={f.id}>
                        <label htmlFor={f.id} className="label text-clay">
                          {f.label}
                        </label>
                        <input
                          id={f.id}
                          type={f.type}
                          autoComplete={f.auto}
                          value={f.value}
                          onChange={(e) => f.set(e.target.value)}
                          aria-invalid={!!f.err}
                          aria-describedby={f.err ? `${f.id}-err` : undefined}
                          className={`mt-1.5 block w-full rounded-none border-0 border-b bg-transparent py-2 text-[1.05rem] outline-none focus:border-ink ${f.err ? "border-saffron" : "border-ink/25"}`}
                        />
                        {f.err && (
                          <p id={`${f.id}-err`} className="label mt-1.5 text-saffron" role="alert">
                            {f.err}
                          </p>
                        )}
                      </div>
                    ))}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={sendEmail}
                      disabled={status === "sending"}
                      className="inline-flex h-13 items-center justify-center rounded-full border border-ink/30 px-6 py-3.5 text-[0.9rem] transition-colors hover:border-ink disabled:opacity-50"
                    >
                      {status === "sending" ? "Sending…" : "Send request by email"}
                    </button>
                    <a
                      href={summary ? whatsappLink(summary) : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!ready}
                      onClick={(e) => {
                        if (!ready) {
                          e.preventDefault();
                          setTouched(true);
                        }
                      }}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.9rem] transition-colors ${
                        ready ? "bg-ink text-bone hover:bg-saffron hover:text-ink" : "cursor-not-allowed bg-ink/15 text-ink/45"
                      }`}
                    >
                      <WhatsAppIcon className="h-4 w-4" /> Request on WhatsApp
                    </a>
                  </div>
                  {touched && !ready && (
                    <p className="label mt-3 text-right text-saffron" role="alert">
                      Choose check-in and check-out dates first.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="label mt-3 text-right text-saffron" role="alert">
                      Something went wrong. Please try WhatsApp or email {site.contact.email}.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
