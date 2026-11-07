export default function StatCard({ label, value, sub, icon: Icon, delta, tone = 'red', className = '' }) {
  const tint = tone === 'gold' ? 'text-secondary bg-secondary-container/15' : 'text-[#ff8a80] bg-primary-container/15';
  return (
    <div className={`panel p-5 relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
        {Icon && <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${tint}`}><Icon className="w-5 h-5" aria-hidden /></span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="font-headline text-headline-lg-mobile md:text-headline-lg font-extrabold text-white">{value}</span>
        {delta && <span className="text-label-sm font-semibold text-emerald-300 bg-emerald-400/10 rounded-full px-2 py-0.5">{delta}</span>}
      </div>
      {sub && <p className="mt-1 text-body-sm text-on-surface-variant">{sub}</p>}
    </div>
  );
}
