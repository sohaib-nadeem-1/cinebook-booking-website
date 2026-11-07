import { memo } from 'react';
import { Accessibility, Check, Crown, Lock, X } from 'lucide-react';
import { money } from '../../utils/format.js';

/** One seat. Status colours follow DESIGN.md: available #1E2333, selected crimson+glow, occupied/reserved dimmed, VIP gold. */
export const Seat = memo(function Seat({ seat, selected, price, onToggle, onBlocked }) {
  const blocked = seat.status === 'occupied' || seat.status === 'reserved';
  const vip = seat.tier === 'vip';
  const base = 'relative grid place-items-center rounded-sm text-[10px] font-bold transition-all duration-150 select-none';
  const size = vip ? 'w-11 h-8 sm:w-12 sm:h-8' : 'w-8 h-8 sm:w-7 sm:h-7';
  let cls;
  if (selected) cls = 'bg-primary-container text-white shadow-[0_0_10px_rgba(229,9,20,.6)] scale-105';
  else if (seat.status === 'occupied') cls = 'bg-surface-container-low text-on-surface-variant/30 cursor-not-allowed border border-white/5';
  else if (seat.status === 'reserved') cls = 'bg-surface-container-low text-secondary/40 cursor-not-allowed border border-dashed border-secondary/30';
  else if (vip) cls = 'bg-surface-container text-secondary border border-secondary hover:bg-secondary-container/20';
  else cls = 'bg-[#1E2333] text-on-surface-variant border border-hairline hover:bg-[#3B4664] hover:text-white';
  const state = selected ? 'selected' : seat.status;
  const label = `Seat ${seat.id}, ${seat.tier === 'vip' ? 'VIP recliner' : seat.tier === 'prime' ? 'prime' : 'standard'}${seat.accessible ? ', wheelchair accessible' : ''}, ${state}${blocked ? '' : `, ${money(price)}`}`;
  return (
    <button type="button" onClick={() => (blocked ? onBlocked(seat) : onToggle(seat))} aria-pressed={selected} aria-disabled={blocked || undefined} aria-label={label} title={`${seat.id} • ${blocked ? state : money(price)}`} className={`${base} ${size} ${cls}`}>
      {selected ? <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden /> : seat.status === 'occupied' ? <X className="w-3 h-3" aria-hidden /> : seat.status === 'reserved' ? <Lock className="w-3 h-3" aria-hidden /> : seat.accessible ? <Accessibility className="w-3.5 h-3.5" aria-hidden /> : vip ? <span className="flex items-center gap-0.5"><Crown className="w-3 h-3" aria-hidden />{seat.number}</span> : seat.number}
    </button>
  );
});

export function SeatLegend({ vipPrice }) {
  const sw = 'w-4 h-4 rounded-sm grid place-items-center';
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl bg-surface-container-low/80 border border-white/5 px-4 py-2.5 text-label-sm text-on-surface" aria-label="Seat legend">
      <li className="flex items-center gap-2"><span className={`${sw} bg-[#1E2333] border border-hairline`} />Available</li>
      <li className="flex items-center gap-2"><span className={`${sw} bg-primary-container`}><Check className="w-3 h-3 text-white" strokeWidth={3} /></span>Selected</li>
      <li className="flex items-center gap-2"><span className={`${sw} bg-surface-container-low border border-white/10`}><X className="w-3 h-3 text-on-surface-variant/50" /></span>Occupied</li>
      <li className="flex items-center gap-2"><span className={`${sw} bg-surface-container-low border border-dashed border-secondary/40`}><Lock className="w-2.5 h-2.5 text-secondary/60" /></span>Reserved</li>
      <li className="flex items-center gap-2"><span className={`${sw} border border-secondary`}><Crown className="w-3 h-3 text-secondary" /></span>VIP Lounger{vipPrice ? ` (${money(vipPrice)})` : ''}</li>
      <li className="flex items-center gap-2"><span className={`${sw} bg-[#1E2333] border border-hairline`}><Accessibility className="w-3 h-3" /></span>Wheelchair</li>
    </ul>
  );
}

export default function SeatMap({ layout, seats, prices, selectedIds, onToggle, onBlocked, zoom = 1, screenLabel = 'THEATER SCREEN (CURVED IMAX 70MM)' }) {
  const byId = Object.fromEntries(seats.map((s) => [s.id, s]));
  const tierOf = (rowId) => layout.rows.find((r) => r.id === rowId).tier;
  const shownTier = new Set();
  return (
    <div className="overflow-auto no-scrollbar touch-pan-x touch-pan-y rounded-xl" tabIndex={0} role="region" aria-label="Seat map. Scroll to pan on small screens.">
      <div className="mx-auto w-max min-w-full px-3 sm:px-8 pb-4 origin-top transition-transform" style={{ zoom }}>
        <div className="screen-beam pt-6 mx-auto max-w-[560px]" aria-hidden>
          <div className="mx-auto h-1.5 w-[88%] rounded-[50%] bg-gradient-to-r from-transparent via-primary-container to-transparent shadow-[0_0_30px_6px_rgba(229,9,20,.35)]" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
          <p className="mt-3 text-center text-[10px] sm:text-label-sm font-bold tracking-[0.15em] text-secondary"><span className="text-primary-container">●</span> {screenLabel} <span className="text-primary-container">●</span></p>
        </div>
        <div className="mt-6 flex flex-col items-center gap-1.5">
          {layout.rows.map((row) => {
            const tier = layout.tiers.find((t) => t.id === row.tier); const showHead = !shownTier.has(row.tier); shownTier.add(row.tier);
            const mk = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => byId[`${row.id}${from + i}`]).filter(Boolean);
            return (
              <div key={row.id} className="w-full flex flex-col items-center">
                {showHead && (
                  <div className={`w-full max-w-[560px] flex items-center justify-between text-[10px] sm:text-label-sm font-bold tracking-wider text-secondary ${row.tier === 'standard' ? '' : 'mt-3'} mb-2`}>
                    <span className="flex items-center gap-1.5">{row.tier === 'vip' && <Crown className="w-3.5 h-3.5" aria-hidden />}{tier.title} ({money(prices[tier.priceKey])})</span><span className="font-medium text-on-surface-variant hidden sm:inline">{tier.rows}</span></div>)}
                <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label={`Row ${row.id}`}>
                  <span className="w-5 text-center text-label-sm font-bold text-secondary" aria-hidden>{row.id}</span>
                  <div className="flex gap-1.5">{mk(1, row.left).map((s) => <Seat key={s.id} seat={s} price={prices[s.tier]} selected={selectedIds.has(s.id)} onToggle={onToggle} onBlocked={onBlocked} />)}</div>
                  {row.tier === 'vip' ? <span className="w-20 sm:w-24 text-center text-[9px] font-bold tracking-wider text-on-surface-variant rounded bg-surface-container-low py-1">LOUNGE BAR WALKWAY</span> : <span className="w-6 sm:w-10" aria-hidden />}
                  <div className="flex gap-1.5">{mk(row.left + 1, row.left + row.right).map((s) => <Seat key={s.id} seat={s} price={prices[s.tier]} selected={selectedIds.has(s.id)} onToggle={onToggle} onBlocked={onBlocked} />)}</div>
                  <span className="w-5 text-center text-label-sm font-bold text-secondary" aria-hidden>{row.id}</span>
                </div>
              </div>);
          })}
        </div>
      </div>
    </div>
  );
}
