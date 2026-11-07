import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const btn = 'min-w-9 h-9 px-2 grid place-items-center rounded-lg text-label-md font-semibold transition-colors disabled:opacity-35 disabled:pointer-events-none hover:bg-white/10';
export function pageWindow(page, pages) {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page, page - 1, page + 1]);
  const arr = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return arr.flatMap((n, i) => (i && n - arr[i - 1] > 1 ? ['…', n] : [n]));
}
export default function Pagination({ page, pages, onChange, edges = false }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {edges && <button className={btn} onClick={() => onChange(1)} disabled={page === 1} aria-label="First page"><ChevronsLeft className="w-4 h-4" /></button>}
      <button className={btn} onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
      {pageWindow(page, pages).map((n, i) => n === '…' ? <span key={`e${i}`} className="px-1 text-on-surface-variant">…</span> : (
        <button key={n} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`} className={`${btn} ${n === page ? 'bg-primary-container text-white shadow-glow hover:bg-primary-container' : 'bg-surface-container-high/60 text-on-surface'}`}>{n}</button>))}
      <button className={btn} onClick={() => onChange(page + 1)} disabled={page === pages} aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
      {edges && <button className={btn} onClick={() => onChange(pages)} disabled={page === pages} aria-label="Last page"><ChevronsRight className="w-4 h-4" /></button>}
    </nav>
  );
}
export const paginate = (items, page, size) => ({ rows: items.slice((page - 1) * size, page * size), pages: Math.max(1, Math.ceil(items.length / size)) });
