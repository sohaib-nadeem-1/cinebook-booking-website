import { useEffect, useRef, useState } from 'react';

/** Click-to-open popover with outside-click + Esc dismissal. `trigger({open, toggle, props})`. */
export default function Menu({ trigger, children, align = 'right', width = 'w-72', label }) {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), props: { 'aria-haspopup': 'menu', 'aria-expanded': open } })}
      {open && (
        <div role="menu" aria-label={label} className={`absolute z-50 mt-2 ${width} ${align === 'right' ? 'right-0' : 'left-0'} glass rounded-xl shadow-modal p-2 animate-fade-in`} style={{ background: 'rgba(24,26,34,.97)' }}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}
export const MenuItem = ({ icon: Icon, children, onClick, danger, className = '' }) => (
  <button role="menuitem" onClick={onClick} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-label-md transition-colors hover:bg-white/5 ${danger ? 'text-error' : 'text-on-surface'} ${className}`}>
    {Icon && <Icon className="w-4 h-4 text-on-surface-variant" aria-hidden />}{children}
  </button>
);
