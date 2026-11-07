/**
 * Seat-map layouts. A layout is generated from row specs so the same SeatMap
 * component can render any auditorium profile. Capacity is always derived from here.
 */
const std = (id, n) => ({ id, tier: 'standard', left: n, right: n });
const prime = (id, n) => ({ id, tier: 'prime', left: n, right: n });

export const LAYOUT_PROFILES = {
  grand: {
    tiers: [
      { id: 'standard', title: 'TIER 1 • STANDARD CINEMA', rows: 'Rows A - C', priceKey: 'standard' },
      { id: 'prime', title: 'TIER 2 • PRIME VIEWING SWEETSPOT', rows: 'Rows D - G', priceKey: 'prime' },
      { id: 'vip', title: 'VIP ULTRA RECLINER LOUNGERS', rows: 'Back Row H • Heated & Powered Footrest', priceKey: 'vip' },
    ],
    rows: [std('A', 6), std('B', 6), std('C', 6), prime('D', 6), prime('E', 6), prime('F', 6), prime('G', 6),
      { id: 'H', tier: 'vip', left: 3, right: 3 }],
    accessible: ['C1', 'C2'],
  },
  boutique: {
    tiers: [
      { id: 'standard', title: 'TIER 1 • LOUNGE CHAISE', rows: 'Rows A - B', priceKey: 'standard' },
      { id: 'prime', title: 'TIER 2 • PRIME LOUNGE', rows: 'Rows C - D', priceKey: 'prime' },
      { id: 'vip', title: 'VIP ULTRA RECLINER LOUNGERS', rows: 'Back Row E • Butler service', priceKey: 'vip' },
    ],
    rows: [std('A', 4), std('B', 4), prime('C', 4), prime('D', 4), { id: 'E', tier: 'vip', left: 2, right: 2 }],
    accessible: ['B1', 'B2'],
  },
};

export const getLayout = (profile = 'grand') => LAYOUT_PROFILES[profile] || LAYOUT_PROFILES.grand;

/** Flat list of every seat: {id,row,number,tier,side,accessible} */
export const buildSeats = (profile = 'grand') => {
  const layout = getLayout(profile);
  const seats = [];
  layout.rows.forEach((r) => {
    for (let i = 1; i <= r.left + r.right; i++) {
      const id = `${r.id}${i}`;
      seats.push({ id, row: r.id, number: i, tier: r.tier, side: i <= r.left ? 'left' : 'right', accessible: layout.accessible.includes(id) });
    }
  });
  return seats;
};

export const profileCapacity = (profile) => buildSeats(profile).length;

/** Ticket price per tier derived from the showtime's prime price. */
export const tierPrices = (primePrice) => ({
  standard: Math.round(primePrice * 0.82 * 2) / 2,
  prime: primePrice,
  vip: Math.round(primePrice * 1.25 * 2) / 2,
});
export const SEAT_STATUS = { AVAILABLE: 'available', SELECTED: 'selected', OCCUPIED: 'occupied', RESERVED: 'reserved' };
