import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, CalendarDays, Clapperboard, Download, Eye, Film, Star, Ticket, TrendingUp, PlayCircle } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import RevenueChart from '../../components/admin/RevenueChart.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Progress, { occupancyColor } from '../../components/common/Progress.jsx';
import Poster from '../../components/common/Poster.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Badge, { STATUS_TONE } from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { Select } from '../../components/common/Field.jsx';
import { ErrorState, Skeleton } from '../../components/common/States.jsx';
import BookingDetailModal from '../../components/admin/BookingDetailModal.jsx';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { downloadCsv } from '../../utils/csv.js';
import { duration, formatDate, money, showDateTime, time12, todayKey } from '../../utils/format.js';

const FRAMES = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']];

const showStatus = (s) => {
  const start = showDateTime(s.date, s.start).getTime(); const end = start + s.movie.runtime * 60000; const now = Date.now();
  if (now > end) return { label: 'Completed', tone: 'slate' }; if (now >= start) return { label: 'Now playing', tone: 'blue' };
  if (s.soldOut) return { label: 'Sold out', tone: 'red' }; if (s.soldPct > 85) return { label: 'Filling fast', tone: 'amber' }; return { label: 'On schedule', tone: 'green' };
};

export default function DashboardPage() {
  useDocTitle('Admin dashboard');
  const toast = useToast(); const [frame, setFrame] = useState('weekly'); const [filter, setFilter] = useState(''); const [view, setView] = useState(null);
  const dash = useAsync(() => adminService.dashboard(), []);
  const rev = useAsync(() => adminService.revenue(frame), [frame]);
  const d = dash.data; const series = rev.data;
  const totals = useMemo(() => { if (!series) return null; const box = series.box.reduce((a, b) => a + b, 0); const food = series.food.reduce((a, b) => a + b, 0); const vip = Math.round((box + food) * 0.05); const t = box + food + vip; return { box, food, vip, t }; }, [series]);
  const screenings = useMemo(() => [...(d?.screenings || [])].sort((a, b) => (showStatus(a).label === 'Completed') - (showStatus(b).label === 'Completed') || a.start.localeCompare(b.start)), [d]);
  const recent = useMemo(() => (d?.recent || []).filter((b) => !filter || b.status === filter), [d, filter]);
  const exportLog = () => { if (!downloadCsv('cinebook-pass-log.csv', recent.map((b) => ({ id: b.id, customer: b.customer.name, movie: b.movieTitle, seats: b.seats.map((s) => s.id).join(' '), total: b.total, status: b.status })))) toast.warning('No bookings to export.'); };
  const exportKpis = () => { downloadCsv('cinebook-kpis.csv', [{ date: todayKey(), movies: d.kpis.movies, todays_shows: d.kpis.shows, admissions: d.kpis.admissions, revenue: d.kpis.revenue.toFixed(2) }]); toast.success('Dashboard KPIs exported.'); };
  if (dash.error) return <ErrorState onRetry={dash.reload} />;
  const k = d?.kpis;

  const segs = totals && [['Box Office', totals.box, 'bg-primary-container', 'text-primary-container'], ['Gourmet Concessions', totals.food, 'bg-secondary', 'text-secondary'], ['VIP Lounges & Bar', totals.vip, 'bg-tertiary', 'text-tertiary']];
  return (
    <div>
      <AdminPageHeader eyebrow="Live circuit telemetry" title="Dashboard" description="Real-time performance metrics and auditorium distribution across complexes.">
        <span className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-surface-container-low border border-white/5 px-4 py-2.5 text-label-md text-on-surface"><CalendarDays className="w-4 h-4 text-primary-container" aria-hidden />{formatDate(todayKey(), { year: true })}</span>
        <Button variant="secondary" icon={Download} onClick={exportKpis} disabled={!d} aria-label="Export KPIs as CSV" className="!px-3" />
      </AdminPageHeader>

      <section aria-label="Key metrics" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-gutter-mobile md:gap-gutter">
        {!k ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />) : <>
          <StatCard label="Total catalog" value={k.movies} icon={Clapperboard} sub="Active in circulation" />
          <StatCard label="Today’s screenings" value={k.shows} icon={PlayCircle} sub={`${k.hallsAtCapacity} halls at ≥90% capacity`} />
          <StatCard label="Paid admissions" value={k.admissions.toLocaleString()} icon={Ticket} sub="Tickets from active bookings" />
          <StatCard label="Gross grossed" value={money(k.revenue)} icon={Banknote} tone="gold" sub={`Avg ${money(k.avgSeat)} / seat`} /></>}
      </section>

      <div className="mt-gutter grid gap-gutter lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <section className="panel p-5 md:p-6" aria-labelledby="rev-t">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="rev-t" className="font-headline text-headline-sm text-white flex items-center gap-2">Revenue Analytics <span className="chip bg-white/10 text-on-surface-variant !text-[10px]">Demo feed</span></h2><p className="text-body-sm text-on-surface-variant">Box office admissions paired against artisanal food &amp; beverage volume.</p></div>
            <div role="tablist" aria-label="Timeframe" className="inline-flex rounded-xl bg-surface-container-lowest p-1">{FRAMES.map(([v, l]) => <button key={v} role="tab" aria-selected={frame === v} onClick={() => setFrame(v)} className={`rounded-lg px-4 py-1.5 text-label-md transition-colors ${frame === v ? 'bg-primary-container text-white shadow-glow' : 'text-on-surface-variant hover:text-white'}`}>{l}</button>)}</div></div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-surface-container-lowest/70 px-4 py-3 text-label-sm"><span className="flex items-center gap-2 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary-container" />Peak performance: <b className="text-white">{series ? `${money(Math.max(...series.box))} • ${series.peakLabel}` : '—'}</b></span><span className="flex items-center gap-1.5 text-on-surface-variant"><i className="w-2.5 h-2.5 rounded-sm bg-primary-container" />Box Office</span><span className="flex items-center gap-1.5 text-on-surface-variant"><i className="w-2.5 h-2.5 rounded-sm bg-secondary" />Gourmet Concessions</span><span className="ml-auto text-on-surface-variant">{series?.caption}</span></div>
          <div className={`mt-4 transition-opacity ${rev.loading ? 'opacity-40' : ''}`}>{series ? <RevenueChart series={series} /> : <Skeleton className="h-64" />}</div>
        </section>
        <section className="panel p-5 md:p-6 space-y-3" aria-labelledby="yield-t"><div><h2 id="yield-t" className="font-headline text-headline-sm text-white">Yield Segments</h2><p className="text-body-sm text-on-surface-variant">Channel attribution across circuit assets ({series?.caption?.toLowerCase()}).</p></div>
          {segs ? segs.map(([name, v, bar, txt]) => { const pct = (v / totals.t) * 100; return (<div key={name} className="rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 font-headline text-title-md text-white"><i className={`w-2 h-2 rounded-full ${bar}`} />{name}</span><b className="font-headline text-title-md text-white">{money(v)}</b></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} /></div><p className="mt-1.5 text-label-sm text-on-surface-variant">{pct.toFixed(1)}% total gross</p></div>); }) : <Skeleton className="h-52" />}
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4"><TrendingUp className="w-5 h-5 text-secondary" aria-hidden /><div><p className="text-label-md text-white">Average Basket Multiplier</p><p className="text-body-sm text-on-surface-variant">2.4 snacks per ticket order (demo)</p></div></div></section>
      </div>

      <div className="mt-gutter grid gap-gutter xl:grid-cols-[1.35fr_1fr]">
        <section className="panel p-5 md:p-6" aria-labelledby="shows-t"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="shows-t" className="font-headline text-headline-sm text-white">Today’s Screening Matrix</h2><p className="text-body-sm text-on-surface-variant">Real-time auditorium loads, showtimes, and hall statuses.</p></div><Link to="/admin/showtimes" className="btn-secondary btn-sm">Manage Grid</Link></div>
          <div className="mt-4"><DataTable caption="Today's screenings" minWidth={640} loading={dash.loading} rows={screenings.slice(0, 8)} empty={<p className="p-8 text-center text-on-surface-variant">No screenings scheduled today.</p>} columns={[
            { key: 'movie', header: 'Movie', render: (s) => <div className="flex items-center gap-3"><Poster src={s.movie.poster} title={s.movie.title} className="w-9 shrink-0" /><div><p className="font-headline text-title-md text-white leading-tight">{s.movie.title}</p><p className="text-label-sm text-on-surface-variant">{s.movie.genres[0]} • {duration(s.movie.runtime)}</p></div></div> },
            { key: 'aud', header: 'Auditorium', render: (s) => <><p className="text-white">{s.auditorium.name}</p><p className="text-label-sm text-on-surface-variant">{s.cinema.short}</p></> },
            { key: 'time', header: 'Time', render: (s) => <span className="text-white whitespace-nowrap">{time12(s.start)}</span> },
            { key: 'occ', header: 'Occupancy', className: 'min-w-[150px]', render: (s) => <div><div className="flex justify-between text-label-sm"><b className={s.soldPct > 85 ? 'text-[#ff8a80]' : s.soldPct >= 50 ? 'text-secondary' : 'text-emerald-300'}>{s.capacity - s.seatsLeft} / {s.capacity}</b><span className="text-on-surface-variant">{s.soldPct}%</span></div><Progress value={s.soldPct} className="mt-1.5" label={`${s.movie.title} occupancy`} /></div> },
            { key: 'st', header: 'Status', render: (s) => { const st = showStatus(s); return <Badge tone={st.tone}>{st.label}</Badge>; } }]} /></div>
          <div className="mt-3 flex items-center justify-between text-label-sm text-on-surface-variant"><span>Displaying {Math.min(8, screenings.length)} of {screenings.length} scheduled</span><Link to="/admin/showtimes" className="flex items-center gap-1 text-secondary hover:underline">Full Schedule<ArrowRight className="w-3.5 h-3.5" aria-hidden /></Link></div></section>

        <section className="panel p-5 md:p-6" aria-labelledby="rb-t"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="rb-t" className="font-headline text-headline-sm text-white">Recent Bookings</h2><p className="text-body-sm text-on-surface-variant">Transaction audit queue.</p></div>
          <Select aria-label="Filter recent bookings by status" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">{[['', 'All statuses'], ['confirmed', 'Confirmed'], ['pending', 'Pending'], ['cancelled', 'Cancelled'], ['refunded', 'Refunded']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></div>
          <div className="mt-4"><DataTable caption="Recent bookings" minWidth={520} loading={dash.loading} rows={recent.slice(0, 6)} empty={<p className="p-8 text-center text-on-surface-variant">No bookings with this status.</p>} columns={[
            { key: 'id', header: 'Booking / Guest', render: (b) => <div className="flex items-center gap-3"><Avatar name={b.customer.name} size="sm" /><div><p className="text-[#ffb4aa] font-semibold">#{b.id}</p><p className="text-label-sm text-on-surface-variant">{b.customer.name}</p></div></div> },
            { key: 'seats', header: 'Seats', render: (b) => <span className="text-white">{b.seats.map((s) => s.id).slice(0, 3).join(', ')}{b.seats.length > 3 ? '…' : ''} <span className="text-on-surface-variant">({b.seats.length})</span></span> },
            { key: 'amt', header: 'Amount', render: (b) => <b className="text-white">{money(b.total)}</b> },
            { key: 'st', header: 'Status', render: (b) => <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge> },
            { key: 'a', header: '', render: (b) => <button onClick={() => setView(b)} aria-label={`View booking ${b.id}`} className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10"><Eye className="w-4 h-4" /></button> }]} /></div>
          <div className="mt-3 flex items-center justify-between text-label-sm text-on-surface-variant"><span>Updated just now</span><button onClick={exportLog} className="text-secondary hover:underline flex items-center gap-1">Export Pass Log<Download className="w-3.5 h-3.5" aria-hidden /></button></div></section>
      </div>
      <BookingDetailModal booking={view} onClose={() => setView(null)} />
    </div>
  );
}
