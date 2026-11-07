import { buildSeats } from '../data/seats.js';
import { AUDITORIUMS } from '../data/cinemas.js';
import { hash } from '../utils/format.js';
import { store } from '../utils/storage.js';

/** Fraction of the house that is already taken, per showtime (deterministic mock). */
export const occupancyTarget = (showtimeId) => {
  const h = hash(`occ:${showtimeId}`);
  if (h > 0.94) return 1; // sold out
  if (h > 0.8) return 0.88 + (h - 0.8) * 0.5; // filling fast
  return 0.12 + h * 0.65;
};

export const baseSeatStatus = (showtimeId, seatId) => {
  const t = occupancyTarget(showtimeId);
  const h = hash(`${showtimeId}:${seatId}`);
  if (h < t * 0.92) return 'occupied';
  if (h < t) return 'reserved';
  return 'available';
};

/** Seat ids sold through bookings on this showtime (cancelled/refunded release their seats). */
export const bookedSeatIds = (showtimeId) => {
  const bookings = store.get('bookings', []);
  return bookings.filter((b) => b.showtimeId === showtimeId && !['cancelled', 'refunded'].includes(b.status)).flatMap((b) => b.seats.map((s) => s.id));
};

export const profileFor = (auditoriumId) => AUDITORIUMS.find((a) => a.id === auditoriumId)?.profile || 'grand';

export const seatStatuses = (showtime) => {
  const booked = new Set(bookedSeatIds(showtime.id));
  return buildSeats(profileFor(showtime.auditoriumId)).map((s) => ({
    ...s, status: booked.has(s.id) ? 'occupied' : baseSeatStatus(showtime.id, s.id),
  }));
};

export const availability = (showtime) => {
  const seats = seatStatuses(showtime);
  const capacity = seats.length;
  const left = seats.filter((s) => s.status === 'available').length;
  return { capacity, left, sold: capacity - left, pct: Math.round(((capacity - left) / capacity) * 100) };
};
