import { AUDITORIUMS, CINEMAS } from './cinemas.js';
import { buildSeats, tierPrices } from './seats.js';
import { calcPricing, DEFAULT_PRICING } from '../utils/pricing.js';
import { addDays, fromMinutes, hash, todayKey, toMinutes } from '../utils/format.js';

const BUFFER = 26; // default turnaround/cleaning window (minutes) — see PRD §4.B.4

const tagFor = (start, end) => {
  if (end > 1440) return 'Late';
  if (start < 750) return 'Matinee';
  if (start >= 1080 && start < 1320) return 'Prime Showtime';
  return 'Standard';
};

/** Build one day of showtimes for every auditorium. Deterministic per date. */
export function generateDay(date, movies, seqStart) {
  const active = movies.filter((m) => ['now_showing', 'advance_booking'].includes(m.status));
  const dayIdx = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 86400000);
  const out = [];
  let seq = seqStart;
  AUDITORIUMS.forEach((aud, ai) => {
    const pool = aud.format === 'VIP LOUNGE' ? active : active.filter((m) => m.formats.includes(aud.format));
    const list = pool.length ? pool : active;
    if (!list.length) return;
    let t = 10 * 60 + Math.floor(hash(`${date}:${aud.id}`) * 4) * 15;
    for (let slot = 0; slot < 5 && t <= 21 * 60 + 45; slot++) {
      const mv = list[(ai * 3 + slot * 2 + dayIdx) % list.length];
      const start = Math.ceil(t / 5) * 5;
      const end = start + mv.runtime;
      out.push({
        id: `st-${String(seq++).padStart(4, '0')}`, movieId: mv.id, cinemaId: aud.cinemaId, auditoriumId: aud.id, date,
        start: fromMinutes(start), end: fromMinutes(end), crossesMidnight: end >= 1440,
        price: aud.basePrice + (start >= 1080 ? 2 : 0), format: aud.format, tag: tagFor(start, end), status: 'scheduled',
      });
      t = end + BUFFER + 4;
    }
  });
  return out;
}

export const seedShowtimes = (movies) => {
  const today = todayKey();
  let seq = 1001;
  const all = [];
  const dates = [];
  for (let d = -3; d <= 6; d++) {
    const date = addDays(today, d);
    const day = generateDay(date, movies, seq);
    seq += day.length; all.push(...day); dates.push(date);
  }
  return { showtimes: all, generatedDates: dates, nextSeq: seq };
};

const PAYMENTS = ['card', 'card', 'wallet', 'card', 'applepay'];

/** Interconnected mock bookings: every booking references a real showtime + seats that were actually free. */
export function seedBookings(showtimes, users, movies, getStatuses) {
  const customers = users.filter((u) => ['customer', 'vip'].includes(u.role));
  const me = users.find((u) => u.email === 'customer@cinebook.com');
  const now = Date.now();
  const taken = new Map();
  const byTime = [...showtimes].filter((s) => s.date >= addDays(todayKey(), -3) && s.date <= addDays(todayKey(), 4));
  const out = [];
  let n = 0;
  const make = (st, user, status, i) => {
    const mv = movies.find((m) => m.id === st.movieId); const aud = AUDITORIUMS.find((a) => a.id === st.auditoriumId); const cin = CINEMAS.find((c) => c.id === st.cinemaId);
    const free = getStatuses(st).filter((s) => s.status === 'available' && !(taken.get(st.id) || new Set()).has(s.id));
    if (free.length < 4 || !mv) return;
    const qty = 1 + Math.floor(hash(`q${i}${st.id}`) * 4);
    const startAt = Math.floor(hash(`p${i}${st.id}`) * (free.length - qty));
    const picked = free.slice(startAt, startAt + qty);
    const set = taken.get(st.id) || new Set(); picked.forEach((p) => set.add(p.id)); taken.set(st.id, set);
    const prices = tierPrices(st.price);
    const seats = picked.map((p) => ({ id: p.id, tier: p.tier, price: prices[p.tier] }));
    const pricing = calcPricing(seats, st.price, DEFAULT_PRICING);
    const created = new Date(new Date(`${st.date}T12:00:00`).getTime() - (2 + (i % 5)) * 86400000);
    out.push({
      id: `CB-${98200 + ++n}`, userId: user.id, customer: { name: user.name, email: user.email, phone: user.phone },
      showtimeId: st.id, movieId: mv.id, movieTitle: mv.title, poster: mv.poster, format: st.format,
      cinemaName: cin.name, cinemaShort: cin.short, auditoriumName: aud.name, date: st.date, start: st.start, tag: st.tag,
      seats, pricing, total: pricing.total, status, paymentMethod: PAYMENTS[i % PAYMENTS.length],
      refund: status === 'refunded' ? { state: 'processed', amount: pricing.total, at: new Date(now - 86400000).toISOString() } : null,
      createdAt: created.toISOString(),
    });
  };
  const today = todayKey();
  const past = byTime.filter((s) => s.date < today);
  const future = byTime.filter((s) => s.date >= today && toMinutes(s.start) > 0);
  // Guarantee a rich history for the demo customer: 2 upcoming, 2 completed, 1 cancelled
  [[future[3], 'confirmed'], [future[17], 'confirmed'], [past[4], 'confirmed'], [past[12], 'confirmed'], [future[9], 'cancelled']]
    .forEach(([st, status], i) => st && me && make(st, me, status, i));
  for (let i = 0; i < 36; i++) {
    const pool = i % 3 === 0 ? past : future;
    const st = pool[Math.floor(hash(`s${i}`) * pool.length)];
    if (!st) continue;
    const status = i % 11 === 0 ? 'cancelled' : i % 13 === 0 ? 'refunded' : i % 7 === 0 && pool === future ? 'pending' : 'confirmed';
    make(st, customers[i % customers.length], status, i + 10);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
