import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';

export const Field = forwardRef(function Field({ label, error, hint, icon: Icon, right, className = '', inputClass = '', id, required, ...props }, ref) {
  const auto = useId(); const fid = id || auto; const eid = `${fid}-err`;
  return (
    <div className={className}>
      {label && <label htmlFor={fid} className="field-label">{label}{required && <span className="text-primary-container" aria-hidden> *</span>}</label>}
      <div className="relative">
        {Icon && <Icon className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" aria-hidden />}
        <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? eid : undefined} required={required} className={`field ${Icon ? 'pl-11' : ''} ${right ? 'pr-12' : ''} ${error ? 'field-error' : ''} ${inputClass}`} {...props} />
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error ? <p id={eid} role="alert" className="mt-1.5 text-body-sm text-error">{error}</p> : hint ? <p className="mt-1.5 text-body-sm text-on-surface-variant/70">{hint}</p> : null}
    </div>
  );
});

export const PasswordField = forwardRef(function PasswordField(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <Field ref={ref} {...props} type={show ? 'text' : 'password'} right={
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="p-2 rounded-lg text-on-surface-variant hover:text-white">
        {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
      </button>} />
  );
});

export function Select({ label, error, className = '', children, id, ...props }) {
  const auto = useId(); const fid = id || auto;
  return (
    <div className={className}>
      {label && <label htmlFor={fid} className="field-label">{label}</label>}
      <select id={fid} aria-invalid={!!error} className={`field appearance-none pr-9 bg-no-repeat cursor-pointer ${error ? 'field-error' : ''}`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23e9bcb6' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 12px center' }} {...props}>
        {children}
      </select>
      {error && <p role="alert" className="mt-1.5 text-body-sm text-error">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, ...props }) {
  const auto = useId(); const fid = id || auto;
  return (
    <div className={className}>
      {label && <label htmlFor={fid} className="field-label">{label}</label>}
      <textarea id={fid} aria-invalid={!!error} className={`field min-h-[96px] resize-y ${error ? 'field-error' : ''}`} {...props} />
      {error && <p role="alert" className="mt-1.5 text-body-sm text-error">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, error, className = '', ...props }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input type="checkbox" className="mt-0.5 w-5 h-5 rounded-md border border-white/20 bg-surface-container-lowest accent-[#e50914] cursor-pointer shrink-0" aria-invalid={!!error} {...props} />
      <span className="text-body-sm text-on-surface-variant">{label}{error && <span role="alert" className="block text-error mt-1">{error}</span>}</span>
    </label>
  );
}

export function Toggle({ checked, onChange, label, id }) {
  return (
    <button type="button" role="switch" id={id} aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary-container shadow-glow' : 'bg-surface-container-highest'}`}>
      <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', className = '', autoFocus, shortcut = false }) {
  return (
    <div className={`relative ${className}`} role="search">
      <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" aria-hidden />
      <input type="search" aria-label={label} value={value} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="field rounded-full pl-11 pr-24 [&::-webkit-search-cancel-button]:hidden" />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {shortcut && !value && <kbd className="hidden sm:block rounded-md bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">⌘K</kbd>}
        {value && <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="p-1.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>}
      </div>
    </div>
  );
}
