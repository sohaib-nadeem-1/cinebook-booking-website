import { AlertTriangle, SearchX } from 'lucide-react';
import Button from './Button.jsx';

export function EmptyState({ icon: Icon = SearchX, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center px-6 py-14 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high grid place-items-center mb-4 border border-white/5"><Icon className="w-7 h-7 text-on-surface-variant" aria-hidden /></div>
      <h3 className="font-headline text-headline-sm text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-body-md text-on-surface-variant">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({ title = 'Something went wrong', message = 'We couldn’t load this right now. Check your connection and try again.', onRetry, className = '' }) {
  return (
    <div role="alert" className={`flex flex-col items-center text-center px-6 py-14 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-error-container/30 grid place-items-center mb-4 border border-error/20"><AlertTriangle className="w-7 h-7 text-error" aria-hidden /></div>
      <h3 className="font-headline text-headline-sm text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body-md text-on-surface-variant">{message}</p>
      {onRetry && <Button className="mt-5" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
export const Skeleton = ({ className = '' }) => (
  <div aria-hidden className={`relative overflow-hidden bg-surface-container-high/70 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent ${className}`} />
);
export const PageLoader = ({ label = 'Loading…' }) => (
  <div role="status" className="min-h-[50vh] grid place-items-center"><div className="flex items-center gap-3 text-on-surface-variant"><span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-primary-container animate-spin" /><span>{label}</span></div></div>
);
export const MovieGridSkeleton = ({ n = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter-mobile md:gap-gutter" aria-busy="true" aria-label="Loading movies">
    {Array.from({ length: n }, (_, i) => <div key={i} className="card p-3 space-y-3"><Skeleton className="aspect-[2/3]" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-9" /></div>)}
  </div>
);
