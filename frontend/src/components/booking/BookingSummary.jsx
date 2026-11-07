import {
  Lock,
  ShieldCheck,
  Star,
  Utensils,
  X,
} from "lucide-react";

import Poster from "../common/Poster.jsx";

import {
  formatDate,
  money,
  time12,
} from "../../utils/format.js";

const TIER = {
  standard: "Standard",
  prime: "Prime",
  vip: "VIP",
};

export function PriceBreakdown({ pricing }) {
  const row =
    "flex items-baseline justify-between gap-3 text-body-md text-on-surface";

  return (
    <div className="space-y-2">
      {pricing.lines.map((line) => (
        <div key={line.tier} className={row}>
          <span>
            {line.qty} × {TIER[line.tier]} Seat{" "}
            <span className="text-on-surface-variant">
              ({money(line.unit)} ea)
            </span>
          </span>

          <span className="tabular-nums">
            {money(line.total)}
          </span>
        </div>
      ))}

      {pricing.concessions > 0 && (
        <div className={row}>
          <span>Duo Combo (1 Large + 2 Drinks)</span>

          <span className="tabular-nums">
            {money(pricing.concessions)}
          </span>
        </div>
      )}

      <div className={row}>
        <span>
          Convenience &amp; Laser Processing Fee
        </span>

        <span className="tabular-nums">
          {money(pricing.serviceFee)}
        </span>
      </div>

      <div className={row}>
        <span>
          State &amp; Entertainment Tax ({pricing.taxRate}%)
        </span>

        <span className="tabular-nums">
          {money(pricing.tax)}
        </span>
      </div>

      <div className="border-t border-white/10 pt-3 flex items-end justify-between">
        <div>
          <p className="font-headline text-title-md font-bold text-white">
            Total Amount
          </p>

          <p className="text-body-sm text-on-surface-variant">
            All taxes &amp; fees included
          </p>
        </div>

        <p
          data-testid="total"
          className="font-headline text-headline-md font-extrabold text-secondary tabular-nums"
        >
          {money(pricing.total)}
        </p>
      </div>
    </div>
  );
}

/** Shared by seat selection (editable) and checkout (read-only). */
export default function BookingSummary({
  showtime,
  seats,
  pricing,
  onRemoveSeat,
  combo,
  onCombo,
  children,
  hideTotals = false,
}) {
  const m = showtime.movie;

  return (
    <div className="space-y-4">
      {/* Movie Details */}
      <div className="flex gap-4">
        <Poster
          src={m.poster}
          title={m.title}
          className="w-20 shrink-0"
        />

        <div className="min-w-0">
          <h2 className="font-headline text-headline-sm text-white leading-tight">
            {m.title}
          </h2>

          <p className="text-label-md font-semibold text-secondary">
            {showtime.format}{" "}
            {showtime.auditorium?.spec?.includes("IMAX")
              ? "Special Experience"
              : "Experience"}
          </p>

          <p className="text-body-sm text-on-surface-variant">
            {m.language} • Dolby Atmos
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-label-sm text-on-surface">
            <Star
              className="w-3.5 h-3.5 fill-secondary text-secondary"
              aria-hidden
            />

            <b>{m.score || "—"}</b>

            <span className="text-on-surface-variant">
              ({m.votes} cinephile reviews)
            </span>
          </p>
        </div>
      </div>

      {/* Showtime Details */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-y border-white/10 py-3 text-body-sm">
        <dt className="text-on-surface-variant">
          Cinema:
        </dt>

        <dd className="text-right text-white">
          {showtime.cinema.name}
        </dd>

        <dt className="text-on-surface-variant">
          Auditorium:
        </dt>

        <dd className="text-right text-white">
          {showtime.auditorium.name}
        </dd>

        <dt className="text-on-surface-variant">
          Showtime:
        </dt>

        <dd className="text-right text-white">
          {formatDate(showtime.date, { long: true })} •{" "}
          {time12(showtime.start)}
        </dd>
      </dl>

      {/* Selected Seats */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-title-md text-white">
            Your Selected Seats
          </h3>

          <span
            className="text-label-md text-secondary"
            data-testid="seat-count"
          >
            {seats.length} Seat
            {seats.length === 1 ? "" : "s"}
          </span>
        </div>

        {seats.length === 0 ? (
          <p className="mt-2 rounded-lg bg-surface-container-lowest/70 border border-dashed border-white/10 p-3 text-body-sm text-on-surface-variant">
            No seats selected yet. Tap any available seat
            on the map.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {seats.map((seat) => (
              <li
                key={seat.id}
                className="flex items-center gap-1.5 rounded-lg bg-surface-container-high pl-2.5 pr-1 py-1 text-label-md text-white"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary-container"
                  aria-hidden
                />

                Seat {seat.id}

                <span className="text-on-surface-variant text-label-sm">
                  ({TIER[seat.tier] || seat.tier})
                </span>

                {onRemoveSeat && (
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    aria-label={`Remove seat ${seat.id}`}
                    className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Concessions */}
      {onCombo && (
        <div className="rounded-xl border border-white/10 bg-surface-container p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-headline text-title-md text-white">
              <Utensils className="w-5 h-5 text-secondary" aria-hidden />
              Gourmet Concessions
            </p>

            <span className="chip bg-secondary-container text-on-secondary-container !py-0.5">
              SAVE 15%
            </span>
          </div>

          <p className="mt-1 text-body-sm text-on-surface-variant">
            Skip the line. Hot buttered truffle popcorn and
            fountain sodas delivered directly to your row.
          </p>

          <label className="mt-3 flex items-center justify-between gap-3 cursor-pointer text-body-md text-white">
            <span>
              Add Duo Combo (1 Large + 2 Sodas){" "}
              <span className="text-on-surface-variant">
                +$14.00
              </span>
            </span>

            <input
              type="checkbox"
              checked={combo}
              onChange={(event) =>
                onCombo(event.target.checked)
              }
              disabled={seats.length === 0}
              className="w-5 h-5 accent-[#e50914] rounded"
              aria-label="Add duo combo"
            />
          </label>
        </div>
      )}

      {/* Pricing */}
      {!hideTotals && seats.length > 0 && (
        <PriceBreakdown pricing={pricing} />
      )}

      {children}

      {/* Security Information */}
      <p className="flex items-center justify-between gap-2 text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-secondary" aria-hidden />
          100% Refund Guarantee (Up to 2h prior)
        </span>

        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" aria-hidden />
          Encrypted Checkout
        </span>
      </p>
    </div>
  );
}