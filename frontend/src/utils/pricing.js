
import { tierPrices } from "../data/seats.js";

export const DEFAULT_PRICING = {
  taxRate: 8,
  serviceFee: 1.5,
};

export const CONCESSIONS = {
  duoCombo: {
    id: "duoCombo",
    name: "Duo Combo (1 Large + 2 Drinks)",
    price: 14,
  },
};

const round2 = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

/**
 * Shared pricing calculation.
 *
 * seats: [{ id, tier, category, price }]
 * primePrice: Showtime prime price
 * settings: { taxRate, serviceFee }
 */
export function calcPricing(
  seats,
  primePrice,
  settings = DEFAULT_PRICING,
  { combo = false } = {}
) {
  if (!Array.isArray(seats)) {
    throw new Error("Seats must be an array.");
  }

  const prices = tierPrices(Number(primePrice));
  const lines = {};

  seats.forEach((seat) => {
    const tier =
      seat.tier ||
      (seat.category === "vip lounge" ? "vip" : seat.category);

    const unitPrice =
      seat.price !== undefined && seat.price !== null
        ? Number(seat.price)
        : Number(prices[tier]);

    if (
      !tier ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error("Invalid seat pricing data.");
    }

    const line = (lines[tier] ||= {
      tier,
      unit: unitPrice,
      qty: 0,
      total: 0,
    });

    line.qty += 1;
    line.total = round2(line.total + unitPrice);
  });

  const quantity = seats.length;

  const ticketSubtotal = round2(
    Object.values(lines).reduce(
      (sum, line) => sum + line.total,
      0
    )
  );

  const concessions =
    combo && quantity > 0
      ? CONCESSIONS.duoCombo.price
      : 0;

  const serviceFee = round2(
    quantity *
      (settings.serviceFee ?? DEFAULT_PRICING.serviceFee)
  );

  const taxRate =
    settings.taxRate ?? DEFAULT_PRICING.taxRate;

  const taxable = ticketSubtotal + serviceFee + concessions;
  const tax = round2(taxable * (taxRate / 100));
  const total = round2(taxable + tax);

  return {
    lines: Object.values(lines),
    quantity,
    ticketSubtotal,
    serviceFee,
    concessions,
    tax,
    total,
    taxRate,
  };
}
