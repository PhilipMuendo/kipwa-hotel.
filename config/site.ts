/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  KIPWA: site configuration. Every client-specific value lives here.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  "Kipwa" is an original concept brand. To adapt this site for a real hotel,
 *  change the values below and swap the photographs in /assets/images
 *  (same filename = no code change). See README.md.
 *
 *  ⚠ PLACEHOLDERS: anything marked `placeholder` is demo content (prices,
 *  room counts, travel times, testimonials). The site labels it on screen
 *  until you replace it and remove the flag.
 */

import type { StaticImageData } from "next/image";

import roomOcean from "@/assets/images/room-ocean.jpg";
import roomCanopy from "@/assets/images/room-canopy.jpg";
import roomFourPoster from "@/assets/images/room-four-poster.jpg";
import roomNet from "@/assets/images/room-net.jpg";
import roomGarden from "@/assets/images/room-garden.jpg";
import canopyDetail from "@/assets/images/canopy-detail.jpg";
import poolDusk from "@/assets/images/pool-dusk.jpg";
import poolInfinity from "@/assets/images/pool-infinity.jpg";
import dawnDhow from "@/assets/images/dawn-dhow.jpg";
import fruitDhow from "@/assets/images/fruit-dhow.jpg";
import reefTurtle from "@/assets/images/reef-turtle.jpg";
import limeAlley from "@/assets/images/lime-alley.jpg";
import oldTown from "@/assets/images/old-town.jpg";
import dhowDusk from "@/assets/images/dhow-dusk.jpg";
import dhowOchre from "@/assets/images/dhow-ochre.jpg";
import grillSmoke from "@/assets/images/grill-smoke.jpg";
import moonSea from "@/assets/images/moon-sea.jpg";
import fishKupaka from "@/assets/images/fish-kupaka.jpg";
import fishLeaf from "@/assets/images/fish-leaf.jpg";
import sardines from "@/assets/images/sardines.jpg";
import spaStones from "@/assets/images/spa-stones.jpg";
import sandbank from "@/assets/images/sandbank.jpg";

export type Img = { src: StaticImageData; alt: string };

export type Room = {
  id: string;
  name: string;
  /** Swahili meaning, shown as a gloss */
  gloss: string;
  line: string;
  size: string;
  guests: number;
  view: string;
  bed: string;
  /** nightly rate in KES, bed & breakfast */
  rate: number;
  amenities: string[];
  images: Img[];
};

export type Moment = {
  time: string;
  /** 0 = midnight … 1 = next midnight; drives the sky */
  hour: number;
  title: string;
  body: string;
  image: Img;
};

export type Dish = { id: string; name: string; english: string; body: string; price: number; image: Img };

export type Experience = { id: string; name: string; gloss: string; body: string; duration: string; image: Img };

export const site = {
  name: "Kipwa",
  wordmark: "KIPWA",
  tagline: "A house on the Swahili coast",
  url: "https://kipwa-hotel.vercel.app", // set the hotel domain when it exists
  locale: "en",

  brand: {
    ink: "#0C0E0F", // night sea
    bone: "#F3EDE3", // lime-washed coral stone
    sand: "#E6DAC6",
    clay: "#8C7A66",
    accent: "#D9922E", // saffron: spice trade, the last light
  },

  contact: {
    phone: "+254 700 000 000", // placeholder
    phoneHref: "tel:+254700000000",
    /** digits only, international format, for wa.me links */
    whatsapp: "254700000000", // placeholder
    email: "stay@example.com", // placeholder
    address: { street: "Beach Road", area: "North Coast", city: "Mombasa", country: "Kenya" }, // placeholder
    coordinates: "4.0435° S · 39.6682° E",
    checkIn: "14:00",
    checkOut: "11:00",
  },

  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TripAdvisor", href: "https://www.tripadvisor.com/" },
  ],

  nav: [
    { label: "Rooms", href: "#rooms" },
    { label: "The Day", href: "#day" },
    { label: "Dining", href: "#dining" },
    { label: "Experiences", href: "#experiences" },
    { label: "Location", href: "#location" },
  ],

  seo: {
    title: "Kipwa | Boutique Beach Hotel in Mombasa, Kenya",
    description:
      "A house of twenty-four rooms on the Swahili coast. Ocean rooms and suites, Swahili cuisine, dhow sails and reef at low tide. Book direct or on WhatsApp.",
    keywords: [
      "Mombasa hotel",
      "boutique hotel Mombasa",
      "beach hotel Mombasa",
      "Swahili coast hotel",
      "Kenya coast resort",
      "Mombasa beach resort",
      "hotels in Nyali",
      "Mombasa accommodation",
    ],
  },

  /** House facts shown in the introduction. */
  facts: [
    { value: "24", label: "Rooms & suites", placeholder: true },
    { value: "1", label: "Reef, right there" },
    { value: "0", label: "Reasons to hurry" },
  ],

  // ── Rooms ────────────────────────────────────────────────────────────────────
  rooms: [
    {
      id: "kipwa",
      name: "Kipwa Room",
      gloss: "the shore at low tide",
      line: "A netted four-poster, lime-washed walls and a garden that smells of frangipani after rain.",
      size: "34 m²",
      guests: 2,
      view: "Garden",
      bed: "Four-poster king",
      rate: 24000,
      amenities: ["Breakfast for two", "Ceiling fan + air-con", "Rain shower", "Outdoor daybed"],
      images: [
        { src: roomNet, alt: "A white four-poster bed draped in a mosquito net beside tall windows" },
        { src: roomGarden, alt: "A bedroom opening onto tropical garden greenery" },
      ],
    },
    {
      id: "bahari",
      name: "Bahari Room",
      gloss: "the sea",
      line: "Floor-to-ceiling shutters that fold back to the Indian Ocean. Wake to the tide, not an alarm.",
      size: "42 m²",
      guests: 2,
      view: "Ocean",
      bed: "King",
      rate: 32000,
      amenities: ["Breakfast for two", "Ocean-facing shutters", "Deep bath", "Private balcony"],
      images: [
        { src: roomOcean, alt: "Sunlit bedroom with wooden shutters open to the sea" },
        { src: canopyDetail, alt: "Sheer white canopy drapes over a bed" },
      ],
    },
    {
      id: "mwezi",
      name: "Mwezi Suite",
      gloss: "the moon",
      line: "A rooftop suite under a makuti roof, with a plunge pool positioned for moonrise.",
      size: "68 m²",
      guests: 3,
      view: "Ocean & sky",
      bed: "Carved four-poster king",
      rate: 54000,
      amenities: ["Breakfast & sundowners", "Private plunge pool", "Roof terrace", "Outdoor shower"],
      images: [
        { src: roomFourPoster, alt: "A carved four-poster bed with white netting under warm lamplight" },
        { src: poolDusk, alt: "An infinity pool at dusk overlooking the ocean" },
      ],
    },
    {
      id: "nahodha",
      name: "Nahodha Suite",
      gloss: "the captain",
      line: "Our largest: a hand-carved Swahili bed, a lounge, and a terrace that faces the dhow route home.",
      size: "85 m²",
      guests: 4,
      view: "Ocean",
      bed: "Hand-carved Swahili king",
      rate: 72000,
      amenities: ["Breakfast & dinner", "Lounge + daybed", "Ocean terrace", "Butler on WhatsApp"],
      images: [
        { src: roomCanopy, alt: "A hand-carved canopy bed in a high-ceilinged Swahili room" },
        { src: poolInfinity, alt: "An infinity pool meeting the horizon" },
      ],
    },
  ] satisfies Room[] as Room[],
  /** Rates are indicative, per night, bed & breakfast. */
  ratesPlaceholder: true,
  currency: "KES",

  // ── A day at Kipwa ───────────────────────────────────────────────────────────
  day: [
    { time: "06:00", hour: 0.25, title: "First light on the kipwa", body: "The tide is out. Walk the warm pools before anyone else, or watch the first dhows slip out from your balcony.", image: { src: dawnDhow, alt: "A lone dhow on a silver sea at sunrise" } },
    { time: "08:30", hour: 0.35, title: "Mahamri & spiced chai", body: "Breakfast on the terrace: coconut mahamri still warm, mango, passion fruit and chai brewed with cardamom.", image: { src: fruitDhow, alt: "A platter of cut tropical fruit on the deck of a boat" } },
    { time: "11:00", hour: 0.46, title: "The reef at low tide", body: "Snorkel the marine park with our boatman. Green turtles graze the seagrass a short swim from the reef.", image: { src: reefTurtle, alt: "A snorkeller swimming beside a green turtle over white sand" } },
    { time: "14:00", hour: 0.58, title: "Pole pole", body: "The hot hours belong to the netted bed, a book and the sea breeze through the shutters. Nobody will knock.", image: { src: roomNet, alt: "A netted four-poster bed in soft afternoon light" } },
    { time: "16:30", hour: 0.69, title: "Into Old Town", body: "Lime-washed alleys, carved doors and coffee from a brass kettle. Our guide knows every shortcut to the fort.", image: { src: oldTown, alt: "A woman walking down a sunlit lime-washed street" } },
    { time: "18:15", hour: 0.76, title: "Sundowner under sail", body: "A traditional dhow, a cold madafu, and the whole sky turning saffron over the water.", image: { src: dhowDusk, alt: "A dhow silhouetted against a saffron sunset" } },
    { time: "20:00", hour: 0.84, title: "Dinner on the sand", body: "Today's catch over coals, coconut rice and pilau, lanterns along the tide line.", image: { src: grillSmoke, alt: "Fish grilling over glowing coals" } },
    { time: "23:00", hour: 0.96, title: "Lala salama", body: "The moon lays a road across the water. The tide will be back at dawn. So will we.", image: { src: moonSea, alt: "A full moon reflected on a dark sea" } },
  ] satisfies Moment[] as Moment[],

  // ── Dining ───────────────────────────────────────────────────────────────────
  dining: [
    { id: "kupaka", name: "Samaki wa kupaka", english: "Grilled fish, coconut & tamarind", body: "The coast's signature: line-caught fish charred over coals, basted in a coconut, tamarind and chilli sauce.", price: 2400, image: { src: fishKupaka, alt: "Grilled fish with a red spiced glaze and lime" } },
    { id: "mishkaki", name: "Mishkaki", english: "Skewers from the coals", body: "Marinated beef and chicken skewers, smoked over coconut husk, with kachumbari and lime.", price: 1600, image: { src: grillSmoke, alt: "Skewers and fish smoking on a grill" } },
    { id: "jani", name: "Samaki wa jani", english: "Fish steamed in banana leaf", body: "Whole fish wrapped in banana leaf with ginger, garlic and coriander. Light and fragrant.", price: 2200, image: { src: fishLeaf, alt: "A whole grilled fish on a banana leaf" } },
    { id: "dagaa", name: "Dagaa wa kukaanga", english: "Crisp coastal sardines", body: "Small fish fried crisp with chilli salt, served with ugali and sukuma.", price: 1200, image: { src: sardines, alt: "Sardines laid on a grill" } },
    { id: "matunda", name: "Matunda", english: "Fruit of the season", body: "Mango, pawpaw, pineapple and passion fruit from the Kongowea market, cut at the table.", price: 800, image: { src: fruitDhow, alt: "A plate of tropical fruit" } },
  ] satisfies Dish[] as Dish[],
  diningPlaceholder: true,

  // ── Experiences ──────────────────────────────────────────────────────────────
  experiences: [
    { id: "dhow", name: "Dhow sail", gloss: "jahazi", body: "Sail a hand-built dhow at sunset with a crew from the creek.", duration: "3 hrs", image: { src: dhowOchre, alt: "A dhow with an ochre sail on blue water" } },
    { id: "reef", name: "Reef & turtles", gloss: "miamba", body: "Snorkel the marine park at low tide with a licensed boatman.", duration: "Half day", image: { src: reefTurtle, alt: "A turtle and a snorkeller over the reef" } },
    { id: "oldtown", name: "Old Town walk", gloss: "mji wa kale", body: "Carved doors, spice stalls and the fort, guided on foot.", duration: "2.5 hrs", image: { src: limeAlley, alt: "A narrow lime-washed alley" } },
    { id: "sandbank", name: "Sandbank lunch", gloss: "fungu", body: "A sandbank that only exists at low tide, and lunch served on it.", duration: "Low tide", image: { src: sandbank, alt: "Boats moored off a sandbank in turquoise water" } },
    { id: "spa", name: "Coral-stone spa", gloss: "pumziko", body: "Warm stone, coconut oil and the sound of the sea.", duration: "60–120 min", image: { src: spaStones, alt: "A hot stone massage with white flowers" } },
  ] satisfies Experience[] as Experience[],

  // ── Guest words ──────────────────────────────────────────────────────────────
  testimonials: [
    { quote: "We came for three nights and stayed for six. The tide decided for us.", name: "Guest name", origin: "Nairobi", placeholder: true },
    { quote: "Breakfast on the terrace, reef by eleven, Old Town by four. The most perfect day we've had in Kenya.", name: "Guest name", origin: "London", placeholder: true },
    { quote: "They booked our whole stay on WhatsApp in ten minutes. Then the sea did the rest.", name: "Guest name", origin: "Kampala", placeholder: true },
  ],

  // ── Location ─────────────────────────────────────────────────────────────────
  location: {
    travel: [
      { place: "Moi International Airport", code: "MBA", time: "~40 min" },
      { place: "SGR Mombasa Terminus", code: "SGR", time: "~45 min" },
      { place: "Old Town & Fort Jesus", code: "OLD", time: "~25 min" },
      { place: "Marine park reef", code: "REEF", time: "10 min by boat" },
    ],
    placeholder: true,
    transfer: "Airport and SGR transfers arranged on request.",
  },

  booking: {
    maxGuests: 6,
    note: "Rates are indicative. We confirm availability and the final price on WhatsApp or email before anything is charged.",
  },

} as const;

export const formatKES = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
