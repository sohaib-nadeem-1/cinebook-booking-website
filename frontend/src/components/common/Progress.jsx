/** Occupancy bar per DESIGN.md: green <50%, amber 50–85%, crimson >85%. */
export const occupancyColor = (pct) => (pct > 85 ? 'bg-primary-container' : pct >= 50 ? 'bg-secondary-container' : 'bg-emerald-400');
export default function Progress({ value, className = '', label }) {
  return (
    <div role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Occupancy'} className={`h-1 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${occupancyColor(value)}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
