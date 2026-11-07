import { store } from '../utils/storage.js';
import { simulate } from './api.js';

export const DEFAULT_SETTINGS = {
  profile: { name: 'Marcus Vance', email: 'admin@cinebook.com', phone: '+1 (555) 019-2834', title: 'Lead Operations Supervisor' },
  cinema: {
    name: 'CineBook Theatres Corp.', address: '145 West 44th Street, Manhattan, New York, NY 10036',
    phone: '+1 (800) 555-2463', taxRate: 8, currency: 'USD', timezone: 'America/New_York',
  },
  notifications: { newBooking: true, cancellation: true, newUser: false, telemetry: true },
  system: { highDensity: false, seatLayout: 'Curved IMAX 70mm Standard', serviceFee: 1.5, turnaroundMinutes: 26, holdMinutes: 10, refundWindowHours: 2 },
};

/** Sync read used by pricing/conflict checks inside other services. */
export const readSettings = () => {
  const s = store.get('settings', {});
  return {
    profile: { ...DEFAULT_SETTINGS.profile, ...s.profile }, cinema: { ...DEFAULT_SETTINGS.cinema, ...s.cinema },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...s.notifications }, system: { ...DEFAULT_SETTINGS.system, ...s.system },
  };
};

export const settingsService = {
  get: () => simulate(() => readSettings(), 120),
  save: (next) => simulate(() => { store.set('settings', next); return readSettings(); }),
  reset: () => simulate(() => { store.remove('settings'); return readSettings(); }),
  /** Public pricing config (tax %, service fee, hold minutes) for the customer app. */
  pricing: () => readSettings(),
};
