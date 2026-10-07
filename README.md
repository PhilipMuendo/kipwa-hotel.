# Kipwa: a house on the Swahili coast

A concept website for a boutique beach hotel in Mombasa, Kenya, built to show what a Mombasa hotel's
website could be. **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lenis**, with a
hand-written WebGL ocean.

> "Kipwa" (Swahili: the shore the sea gives back at low tide) is an original concept brand.
> All client values live in **`config/site.ts`**; all photos are replaceable stock (see `IMAGES.md`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## The idea

The site is **one day on the coast**, from first light to moonrise, framed by the **Swahili pointed arch**.

| # | Section | What happens |
|---|---|---|
| 00 | **Hero** | A lime-washed wall with an arched doorway. Through it, a *live* WebGL Indian Ocean at sunrise. The door opens on load; on scroll you step through it, the sun climbs, and "Karibu" greets you on the water. |
| 01 | **Karibu** | Slides up over the sea with an arched crown; the manifesto surfaces word by word. |
| 02 | **Rooms** | A pinned horizontal walk past four arched doorways; each opens a full room sheet with gallery, specs, amenities, rate, *Book this room* and *Ask on WhatsApp*. |
| 03 | **A day at Kipwa** | The signature: the section pins and the clock runs 06:00 → 23:00 while the live ocean follows the hour: sunrise road, noon, saffron afterglow, moon road and stars. |
| 04 | **Dining** | A plate seen from above stays pinned and turns to each dish as the menu scrolls (Kiswahili names first). |
| 05 | **Beyond the house** | Five tall slices of the coast; the focused one opens wide. |
| — | **Pole pole** | An arched window onto the pool grows until it's the whole screen. |
| 06 | **Guest words** | One review at a time, set large. |
| 07 | **Location** | A hand-drawn, self-drawing chart of the Mombasa coast, with travel times and transfers. |
| 08 | **Book direct** | Range calendar, guests, room, indicative KES total → **Request on WhatsApp** (prefilled message) or **email request** (`/api/booking`). |
| 09 | **Lala salama** | The same ocean at night under a rising moon. |

Mombasa faces east, so the shader is honest: the sun rises over the sea, sets behind you (only the afterglow
colours the water), and the moon rises over the ocean at night.

## Make it a real hotel

| What | Where |
|---|---|
| Name, tagline, domain | `config/site.ts` → `name`, `tagline`, `url` |
| Phone, **WhatsApp number**, email, address | `config/site.ts` → `contact` (`whatsapp` = digits only, e.g. `2547…`) |
| Colours (ink, bone, sand, clay, saffron accent) | `config/site.ts` → `brand` |
| Rooms, rates (KES), amenities, photos | `config/site.ts` → `rooms` |
| The day, menu, experiences, reviews, travel times | `config/site.ts` → `day`, `dining`, `experiences`, `testimonials`, `location` |
| Photography | `assets/images/` (same filename = no code change), then `python scripts/grade.py` |
| Booking requests | set `BOOKING_WEBHOOK_URL` (Zapier/Make/PMS/Slack). Without it, requests are only logged. |

**Placeholders are labelled on screen** (room count, rates "indicative", menu prices, travel times, reviews,
cancellation policy) until replaced. Do not launch with them.

For live availability and payment, connect a booking engine / channel manager (e.g. Cloudbeds, SiteMinder) and
point the *Check availability* buttons at it, or keep the WhatsApp-first request flow that many coast hotels prefer.

## Architecture

```
app/            layout (fonts, metadata, Hotel JSON-LD, arch clipPath), page, api/booking, sitemap, robots, OG image, icon
components/     one file per section + OceanCanvas (WebGL) + ui/ (Reveal, ArchMark, …)
config/site.ts  all hotel content
lib/            smooth scroll, booking context, WhatsApp helpers, media hooks
assets/images/  graded photography (static imports → responsive, blur placeholders)
scripts/        grade.py (warm film grade)
```

## Accessibility & performance

- The ocean is one full-screen fragment shader (no three.js): it renders only while visible, caps resolution, freezes for reduced motion, and falls back to a photo.
- `prefers-reduced-motion`: Lenis off, transforms skipped, the day sequence becomes a static list.
- Semantic landmarks, one `h1`, skip link, focus-trapped menu and room sheet (Esc closes), native radios, keyboard-navigable calendar (arrow keys), labelled form errors, live regions.
- Homepage statically prerendered; only `/api/booking` is dynamic.
