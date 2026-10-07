import { site } from "@/config/site";

/** Build a wa.me link with a prefilled, human-readable message. */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const helloMessage = `Hello ${site.name}, I'd like to ask about a stay.`;

/** Current time in Mombasa (EAT, UTC+3), as HH:MM. */
export function mombasaTime(d = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Nairobi" }).format(d);
}
