import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { store } from '../utils/storage.js';
import { readSettings } from '../services/settingsService.js';
import { useToast } from './ToastContext.jsx';

/**
 * Seat hold simulation (PRD: 10-minute hold). The hold lives in localStorage with an absolute
 * expiry so it survives refreshes. A real backend would own the lock (e.g. Redis TTL) — see seatService.
 */
const Ctx = createContext(null);
const EMPTY = { showtimeId: null, seats: [], expiresAt: null, combo: false };

export function BookingProvider({ children }) {
  const toast = useToast();
  const [hold, setHold] = useState(() => {
    const h = store.get('hold', EMPTY);
    return h.expiresAt && h.expiresAt <= Date.now() ? EMPTY : h;
  });
  const [now, setNow] = useState(Date.now());
  const [expired, setExpired] = useState(null); // showtimeId whose hold just lapsed
  const toastRef = useRef(toast); toastRef.current = toast;

  useEffect(() => { store.set('hold', hold); }, [hold]);

  useEffect(() => {
    if (!hold.expiresAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hold.expiresAt]);

  useEffect(() => {
    if (hold.expiresAt && now >= hold.expiresAt) {
      setExpired(hold.showtimeId); setHold(EMPTY);
      toastRef.current.warning('Your 10-minute seat hold expired and the seats were released.');
    }
  }, [now, hold]);

  const remaining = hold.expiresAt ? Math.max(0, Math.round((hold.expiresAt - now) / 1000)) : 0;

  const toggleSeat = useCallback((showtimeId, seat) => {
    setExpired(null); setNow(Date.now());
    setHold((h) => {
      const base = h.showtimeId === showtimeId ? h : { ...EMPTY, showtimeId };
      const has = base.seats.some((s) => s.id === seat.id);
      const seats = has ? base.seats.filter((s) => s.id !== seat.id) : [...base.seats, { id: seat.id, tier: seat.tier }];
      if (!seats.length) return { ...EMPTY, combo: base.combo };
      const expiresAt = base.expiresAt && base.expiresAt > Date.now() ? base.expiresAt : Date.now() + readSettings().system.holdMinutes * 60000;
      return { ...base, seats, expiresAt };
    });
  }, []);
  const removeSeat = useCallback((seatId) => setHold((h) => { const seats = h.seats.filter((s) => s.id !== seatId); return seats.length ? { ...h, seats } : EMPTY; }), []);
  const setCombo = useCallback((combo) => setHold((h) => ({ ...h, combo })), []);
  const clear = useCallback(() => { setHold(EMPTY); setExpired(null); }, []);
  const dismissExpired = useCallback(() => setExpired(null), []);

  const value = useMemo(() => ({ hold, remaining, expired, toggleSeat, removeSeat, setCombo, clear, dismissExpired }),
    [hold, remaining, expired, toggleSeat, removeSeat, setCombo, clear, dismissExpired]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useBooking = () => useContext(Ctx);
