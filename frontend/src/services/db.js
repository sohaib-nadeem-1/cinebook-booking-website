/**
 * Repository layer: the single place that reads/writes persisted collections and seeds demo data.
 * Services call these; nothing else touches storage. Swap for HTTP calls when the API exists.
 */
import { store } from '../utils/storage.js';
import { SEED_MOVIES } from '../data/movies.js';
import { SEED_USERS } from '../data/users.js';
import { generateDay, seedShowtimes, seedBookings } from '../data/generator.js';
import { addDays, todayKey } from '../utils/format.js';
import { seatStatuses } from './availability.js';

export const db = {
  movies: {
    all() { let m = store.get('movies'); if (!m) { m = SEED_MOVIES; store.set('movies', m); } return m; },
    save(list) { store.set('movies', list); },
  },
  users: {
    all() { let u = store.get('users'); if (!u) { u = SEED_USERS; store.set('users', u); } return u; },
    save(list) { store.set('users', list); },
  },
  showtimes: {
    all() {
      let st = store.get('showtimes');
      if (!st) {
        const seeded = seedShowtimes(db.movies.all());
        st = seeded.showtimes; store.set('showtimes', st); store.set('stMeta', { generatedDates: seeded.generatedDates, nextSeq: seeded.nextSeq });
      }
      return db.showtimes.ensureHorizon(st);
    },
    /** Keep the next 7 days populated as real time passes (admin-deleted days are not regenerated). */
    ensureHorizon(st) {
      const meta = store.get('stMeta', { generatedDates: [], nextSeq: 5000 });
      const today = todayKey();
      let changed = false; const next = [...st];
      for (let d = 0; d <= 6; d++) {
        const date = addDays(today, d);
        if (!meta.generatedDates.includes(date)) {
          const day = generateDay(date, db.movies.all(), meta.nextSeq);
          meta.nextSeq += day.length; meta.generatedDates.push(date); next.push(...day); changed = true;
        }
      }
      if (changed) { store.set('showtimes', next); store.set('stMeta', meta); }
      return changed ? next : st;
    },
    save(list) { store.set('showtimes', list); },
  },
  bookings: {
    all() {
      let b = store.get('bookings');
      if (!b) {
        // seed after showtimes exist; availability reads bookings, so write an empty list first
        store.set('bookings', []);
        b = seedBookings(db.showtimes.all(), db.users.all(), db.movies.all(), seatStatuses);
        store.set('bookings', b); store.set('bookingSeq', 98200 + b.length + 100);
      }
      return b;
    },
    save(list) { store.set('bookings', list); },
    nextId() { const n = store.get('bookingSeq', 98400) + 1; store.set('bookingSeq', n); return `CB-${n}`; },
  },
};
