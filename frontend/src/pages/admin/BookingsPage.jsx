import { useEffect, useMemo, useState } from 'react';
import { Ban, Check, Copy, Download, Eye, Gauge, Banknote, RotateCcw, Ticket } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import BookingDetailModal from '../../components/admin/BookingDetailModal.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination, { paginate } from '../../components/common/Pagination.jsx';
import Poster from '../../components/common/Poster.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Badge, { STATUS_TONE } from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import { ConfirmDialog } from '../../components/common/Modal.jsx';
import { Field, Select } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState } from '../../components/common/States.jsx';
import { bookingService, canCancel } from '../../services/bookingService.js';
import { movieService } from '../../services/movieService.js';
import { showtimeService } from '../../services/showtimeService.js';
import { logAudit } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryState } from '../../hooks/useQueryState.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { downloadCsv } from '../../utils/csv.js';
import { formatDate, money, time12, todayKey } from '../../utils/format.js';

const STATUSES = [['', 'All statuses'], ['confirmed', 'Confirmed'], ['pending', 'Pending'], ['cancelled', 'Cancelled'], ['refunded', 'Refunded']];

export default function AdminBookingsPage() {
  useDocTitle('Bookings management');
  const { admin, can } = useAuth(); const toast = useToast();
  const [f, set, reset] = useQueryState({ q: '', cust: '', movie: '', status: '', date: '', rows: '10', page: '1' });
  const [idText, setIdText] = useState(f.q); const [cText, setCText] = useState(f.cust); const dId = useDebounce(idText, 250); const dC = useDebounce(cText, 250);
  useEffect(() => { if (dId !== f.q) set({ q: dId, page: '1' }); }, [dId]); // eslint-disable-line
  useEffect(() => { if (dC !== f.cust) set({ cust: dC, page: '1' }); }, [dC]); // eslint-disable-line
  useEffect(() => { setIdText(f.q); }, [f.q]); useEffect(() => { setCText(f.cust); }, [f.cust]);
  const movies = useAsync(() => movieService.list({ scope: 'admin' }), []);
  const { data, loading, error, reload } = useAsync(() => bookingService.listAdmin(), [f.status, f.date, f.movie]);
  const shows = useAsync(() => showtimeService.list({ date: todayKey() }), []);
  const [view, setView] = useState(null); const [act, setAct] = useState(null); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState('');
  const list = useMemo(() => (data || []).filter((b) => (!f.q || String(b.id).toLowerCase().includes(f.q.toLowerCase().replace('#', ''))) && (!f.cust || `${b.customer?.name || ''} ${b.customer?.email || ''}`.toLowerCase().includes(f.cust.toLowerCase())) && (!f.status || b.status === f.status) && (!f.movie || String(b.movie?.id || b.movie_id || '') === String(f.movie)) && (!f.date || b.date === f.date)), [data, f.q, f.cust, f.status, f.movie, f.date]);
  const per = Number(f.rows) || 10; const page = Math.min(Number(f.page) || 1, Math.max(1, Math.ceil(list.length / per))); const { rows, pages } = paginate(list, page, per);
  const occ = shows.data?.length ? Math.round(shows.data.reduce((a, s) => a + s.soldPct, 0) / shows.data.length) : 0;
  const gate = (data || []).filter((b) => b.date === todayKey() && ['confirmed', 'pending'].includes(b.status)).reduce((a, b) => a + b.total, 0);
  const filtersOn = f.q || f.cust || f.movie || f.status || f.date;
  const clear = () => { reset(); setIdText(''); setCText(''); };

  const copy = async (id) => { try { await navigator.clipboard.writeText(id); setCopied(id); setTimeout(() => setCopied(''), 1500); toast.success(`Copied ${id}`); } catch { toast.info(id); } };
  const run = async () => {
    setBusy(true);
    try { const r = await bookingService.cancel(act.b.id, { by: 'admin' }); logAudit(admin.name, `Cancelled booking ${r.id}`); toast.success(`Booking ${r.id} cancelled and seats released`); setAct(null); setView(null); reload(true); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const exportCsv = () => { if (!downloadCsv('cinebook-bookings.csv', list.map((b) => ({ booking_id: b.id, customer: b.customer.name, email: b.customer.email, movie: b.movieTitle, date: b.date, time: b.start, seats: b.seats.map((s) => s.id).join(' '), total: b.total, status: b.status })))) toast.warning('No bookings match the current filters.'); else toast.success(`Exported ${list.length} bookings.`); };
  const rowActions = (b) => (
    <div className="flex justify-end gap-0.5"><IconButton icon={Eye} label={`View booking ${b.id}`} onClick={() => setView(b)} />
      <IconButton icon={Ban} tone="danger" label={`Cancel booking ${b.id}`} disabled={!canCancel(b)} onClick={() => setAct({ type: 'cancel', b })} />
      </div>);
  const cols = [
    { key: 'id', header: 'Booking ID', render: (b) => <div className="flex items-center gap-1.5"><b className="text-[#ffb4aa]">#{b.id}</b><button onClick={() => copy(b.id)} aria-label={`Copy booking ID ${b.id}`} className="p-1 rounded text-on-surface-variant hover:text-white">{copied === b.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}</button></div> },
    { key: 'c', header: 'Customer', render: (b) => <div className="flex items-center gap-3"><Avatar name={b.customer.name} size="sm" /><div><p className="text-white font-semibold">{b.customer.name}</p><p className="text-label-sm text-on-surface-variant">{b.customer.email}</p></div></div> },
    { key: 'm', header: 'Movie & format', render: (b) => <div className="flex items-center gap-3"><Poster src={b.poster} title={b.movieTitle} className="w-8 shrink-0" /><div><p className="font-headline text-title-md text-white leading-tight">{b.movieTitle}</p><p className="text-label-sm font-bold text-secondary uppercase">{b.format}</p></div></div> },
    { key: 'a', header: 'Auditorium', render: (b) => <><p className="text-white">{b.cinemaShort}</p><p className="text-label-sm text-on-surface-variant">{b.auditoriumName}</p></> },
    { key: 's', header: 'Showtime', render: (b) => <><p className="text-white whitespace-nowrap">{formatDate(b.date)}, {time12(b.start)}</p><p className="text-label-sm text-on-surface-variant">{b.tag}</p></> },
    { key: 'seats', header: 'Seats', render: (b) => <><p className="text-white">{b.seats.map((s) => s.id).join(', ')}</p><p className="text-label-sm text-on-surface-variant">{b.seats.length} ticket{b.seats.length > 1 ? 's' : ''}</p></> },
    { key: 't', header: 'Amount', render: (b) => <b className="text-white">{money(b.total)}</b> },
    { key: 'st', header: 'Status', render: (b) => <Badge tone={STATUS_TONE[b.status]} dot>{b.status}</Badge> },
    { key: 'ac', header: 'Actions', headerClass: 'text-right', render: rowActions },
  ];
  if (error) return <ErrorState onRetry={reload} />;
  return (
    <div>
      <AdminPageHeader eyebrow="Live operations desk" title="Bookings Management" description="Review reservations, customer details, seat assignments, and cancel bookings.">
        <div className="flex gap-3"><div className="rounded-xl bg-surface-container-low border border-white/5 px-4 py-2.5 flex items-center gap-3"><Gauge className="w-5 h-5 text-secondary" aria-hidden /><div><p className="text-label-sm text-on-surface-variant">Real-time occupancy</p><p className="font-headline text-title-md font-bold text-white">{occ}%</p></div></div><div className="rounded-xl bg-surface-container-low border border-white/5 px-4 py-2.5 flex items-center gap-3"><Banknote className="w-5 h-5 text-secondary" aria-hidden /><div><p className="text-label-sm text-on-surface-variant">Today’s gross gate</p><p className="font-headline text-title-md font-bold text-white">{money(gate)}</p></div></div></div>
        <Button icon={Download} onClick={exportCsv}>Export CSV / Audit Log</Button></AdminPageHeader>

      <div className="panel p-4"><div className="grid sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-end">
        <Field label="Booking ID" placeholder="Booking ID (#CB-98241)…" value={idText} onChange={(e) => setIdText(e.target.value)} />
        <Field label="Customer" placeholder="Customer name or email…" value={cText} onChange={(e) => setCText(e.target.value)} />
        <Select label="Movie" value={f.movie} onChange={(e) => set({ movie: e.target.value, page: '1' })}><option value="">All Movies</option>{(movies.data || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select>
        <Select label="Status" value={f.status} onChange={(e) => set({ status: e.target.value, page: '1' })}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
        <Field label="Showtime date" type="date" value={f.date} onChange={(e) => set({ date: e.target.value, page: '1' })} />
        <Button variant="secondary" icon={RotateCcw} onClick={clear} disabled={!filtersOn}>Reset</Button></div>
        <p className="mt-3 text-label-sm text-on-surface-variant" aria-live="polite">Showing <b className="text-white">{list.length.toLocaleString()}</b> bookings found{filtersOn && <button onClick={clear} className="ml-3 text-primary underline">Clear all filters</button>}</p></div>

      <div className="mt-4 panel overflow-hidden">
        <DataTable caption="Bookings ledger" columns={cols} rows={rows} loading={loading && !data} minWidth={1180} empty={<EmptyState icon={Ticket} title="No bookings found" message="No bookings match your search. Try a different booking ID, customer or date." action={filtersOn ? <Button variant="secondary" onClick={clear}>Clear filters</Button> : undefined} />} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 text-body-sm text-on-surface-variant"><div className="flex items-center gap-3"><label htmlFor="brpp">Rows per page:</label><select id="brpp" value={f.rows} onChange={(e) => set({ rows: e.target.value, page: '1' })} className="field !w-auto !py-1.5">{['10', '25', '50'].map((n) => <option key={n}>{n}</option>)}</select><span>{list.length ? `${(page - 1) * per + 1}–${Math.min(page * per, list.length)} of ${list.length} items` : '0 items'}</span></div><Pagination page={page} pages={pages} onChange={(p) => set({ page: String(p) })} edges /></div>
      </div>
      <BookingDetailModal booking={view} onClose={() => setView(null)} actions={view && <>{canCancel(view) && <Button variant="danger" icon={Ban} onClick={() => setAct({ type: 'cancel', b: view })}>Cancel booking</Button>}</>} />
      <ConfirmDialog open={!!act} onClose={() => setAct(null)} onConfirm={run} loading={busy} danger title="Cancel this booking?" confirmText="Cancel booking"
        message={act && `Cancel booking ${act.b.id} for ${act.b.customer.name} and release seats ${act.b.seats.map((s) => s.id).join(', ')}. No payment refund is processed.`} />
    </div>
  );
}
