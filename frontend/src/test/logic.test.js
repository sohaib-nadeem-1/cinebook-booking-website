import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcPricing } from '../utils/pricing.js';
import { tierPrices, buildSeats } from '../data/seats.js';
import { authService } from '../services/authService.js';
import { movieService } from '../services/movieService.js';

describe('pricing', () => {
  it('computes tiers, fee and tax consistently', () => {
    const p = calcPricing([{ id: 'E7', tier: 'prime' }, { id: 'E8', tier: 'prime' }, { id: 'E9', tier: 'prime' }], 22.5, { taxRate: 8, serviceFee: 1.5 });
    expect(p.ticketSubtotal).toBe(67.5); expect(p.serviceFee).toBe(4.5); expect(p.tax).toBe(5.76); expect(p.total).toBe(77.76);
  });
  it('adds combo before tax', () => {
    const p = calcPricing([{ id: 'A1', tier: 'standard' }], 20, { taxRate: 10, serviceFee: 1 }, { combo: true });
    expect(p.concessions).toBe(14); expect(p.total).toBe(((tierPrices(20).standard + 1 + 14) * 1.1).toFixed(2) * 1);
  });
  it('seat layouts have unique ids', () => { ['grand', 'boutique'].forEach((k) => { const s = buildSeats(k); expect(new Set(s.map((x) => x.id)).size).toBe(s.length); }); });
});

const json = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

describe('auth (API mocked)', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('wrong password is rejected with the server message', async () => {
    vi.stubGlobal('fetch', vi.fn(() => json({ message: 'Invalid credentials' }, false, 401)));
    await expect(authService.login({ email: 'a@b.com', password: 'x', portal: 'customer' })).rejects.toMatchObject({ status: 401 });
  });

  it('staff cannot use the customer portal', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => (String(url).endsWith('/login') ? json({ token: 't' }) : json({ data: { id: 1, name: 'Admin', userRole: 'admin' } }))));
    await expect(authService.login({ email: 'admin@cinebook.com', password: 'admin123', portal: 'customer' })).rejects.toMatchObject({ code: 'WRONG_PORTAL' });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('customer can sign in through the customer portal', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => (String(url).endsWith('/login') ? json({ token: 't' }) : json({ data: { id: 2, name: 'Sam', userRole: 'customer' } }))));
    const u = await authService.login({ email: 'c@cinebook.com', password: 'password123', portal: 'customer' });
    expect(u.name).toBe('Sam');
    expect(u.password).toBeUndefined();
  });
});

describe('movies (API mocked)', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('maps backend status to frontend status and hides ended movies from the public list', async () => {
    const rows = [
      { id: 1, title: 'A', runtime: 100, age_rating: 'PG', status: 'Now Showing', genres: [], formats: [] },
      { id: 2, title: 'B', runtime: 100, age_rating: 'PG', status: 'Coming Soon', genres: [], formats: [] },
      { id: 3, title: 'C', runtime: 100, age_rating: 'PG', status: 'Ended', genres: [], formats: [] },
    ];
    vi.stubGlobal('fetch', vi.fn(() => json({ allMovies: rows })));
    const pub = await movieService.list({ sort: 'title' });
    expect(pub.map((m) => [m.title, m.status])).toEqual([['A', 'now_showing'], ['B', 'coming_soon']]);
    const admin = await movieService.list({ scope: 'admin', sort: 'title' });
    expect(admin).toHaveLength(3);
  });
});
