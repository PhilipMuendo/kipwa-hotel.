"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Shared booking intent: lets any "Book this room" button prefill the booking widget. */
type Ctx = { roomId: string | null; setRoomId: (id: string | null) => void };
const BookingCtx = createContext<Ctx>({ roomId: null, setRoomId: () => {} });
export const useBooking = () => useContext(BookingCtx);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  return <BookingCtx.Provider value={{ roomId, setRoomId }}>{children}</BookingCtx.Provider>;
}
