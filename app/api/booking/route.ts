import { NextResponse } from "next/server";
import { site } from "@/config/site";

/**
 * Booking requests (not confirmed bookings).
 *
 * Validates the request server-side, then forwards it. Set BOOKING_WEBHOOK_URL
 * (Zapier / Make / your PMS or channel manager / a Slack channel) to deliver it.
 * Without it, requests are only logged to the server console.
 */

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (str(b.website)) return NextResponse.json({ ok: true }); // honeypot

  const room = site.rooms.find((r) => r.id === str(b.room, 40));
  const request = {
    room: room?.name ?? "",
    checkIn: str(b.checkIn, 10),
    checkOut: str(b.checkOut, 10),
    adults: Math.max(1, Math.min(12, Number(b.adults) || 0)),
    children: Math.max(0, Math.min(12, Number(b.children) || 0)),
    name: str(b.name, 120),
    email: str(b.email, 200),
    phone: str(b.phone, 40),
    receivedAt: new Date().toISOString(),
  };

  const errors: string[] = [];
  if (!room) errors.push("room");
  if (!isDate(request.checkIn)) errors.push("checkIn");
  if (!isDate(request.checkOut) || request.checkOut <= request.checkIn) errors.push("checkOut");
  if (request.name.length < 2) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(request.email)) errors.push("email");
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const hook = process.env.BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
      if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
    } catch (e) {
      console.error("[booking] delivery failed", e);
      return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
    }
  } else {
    console.info("[booking] new request (set BOOKING_WEBHOOK_URL to deliver):", request);
  }
  return NextResponse.json({ ok: true });
}
