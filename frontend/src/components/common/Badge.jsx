const TONES = {
  green: 'bg-emerald-500/15 text-emerald-300', red: 'bg-primary-container/20 text-[#ff8a80]', amber: 'bg-secondary-container/20 text-secondary',
  gold: 'bg-secondary-container/25 text-secondary', slate: 'bg-white/10 text-on-surface-variant', blue: 'bg-sky-400/15 text-sky-300', solid: 'bg-primary-container text-white',
};
export default function Badge({ tone = 'slate', dot = false, icon: Icon, children, className = '' }) {
  return (
    <span className={`chip ${TONES[tone]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />}{Icon && <Icon className="w-3.5 h-3.5" aria-hidden />}{children}
    </span>
  );
}
export const STATUS_TONE = { confirmed: 'green', pending: 'amber', cancelled: 'red', refunded: 'blue', active: 'green', inactive: 'slate', scheduled: 'green', now_showing: 'green', advance_booking: 'red', coming_soon: 'amber', archived: 'slate' };
