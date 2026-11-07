import { EmptyState } from './States.jsx';
import { Skeleton } from './States.jsx';

/**
 * columns: [{key, header, render?(row), className?, headerClass?}]. Wraps in a horizontal scroller
 * (tablet/mobile), zebra rows + sticky header per DESIGN.md.
 */
export default function DataTable({ columns, rows, rowKey = 'id', loading, empty, caption, minWidth = 860, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl no-scrollbar" tabIndex={0} role="region" aria-label={caption || 'Data table'}>
      <table className="w-full text-left text-body-sm" style={{ minWidth }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-surface-container-high/80 sticky top-0 z-10"><tr>{columns.map((c) => <th key={c.key} scope="col" className={`th ${c.headerClass || ''}`}>{c.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5">
          {loading && Array.from({ length: 5 }, (_, i) => <tr key={i}><td colSpan={columns.length} className="p-3"><Skeleton className="h-12" /></td></tr>)}
          {!loading && rows.map((r) => (
            <tr key={r[rowKey]} onClick={onRowClick ? () => onRowClick(r) : undefined} className="even:bg-[#141824]/70 odd:bg-surface-container-low hover:bg-surface-container transition-colors">
              {columns.map((c) => <td key={c.key} className={`td ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (empty || <EmptyState title="Nothing to show" message="Try adjusting your search or filters." />)}
    </div>
  );
}
