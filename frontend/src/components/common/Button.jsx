import { Loader2 } from 'lucide-react';

const V = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger' };
/** Buttons that run async work pass `loading` so double-clicks are impossible and state is visible. */
export default function Button({ variant = 'primary', size, loading = false, loadingText, icon: Icon, iconRight: IconR, className = '', children, disabled, type = 'button', ...rest }) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`${V[variant]} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...rest}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : Icon && <Icon className="w-4 h-4" aria-hidden />}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && IconR && <IconR className="w-4 h-4" aria-hidden />}
    </button>
  );
}
