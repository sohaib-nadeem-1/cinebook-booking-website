import { useEffect, useMemo } from 'react';
import { RotateCcw, X, Film, Mail } from 'lucide-react';
import { useState } from 'react';
import MovieCard from '../../components/movies/MovieCard.jsx';
import Pagination, { paginate } from '../../components/common/Pagination.jsx';
import { Select, SearchInput, Field } from '../../components/common/Field.jsx';
import Button from '../../components/common/Button.jsx';
import { EmptyState, ErrorState, MovieGridSkeleton } from '../../components/common/States.jsx';
import { movieService, SORT_OPTIONS } from '../../services/movieService.js';
import { showtimeService } from '../../services/showtimeService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryState } from '../../hooks/useQueryState.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { FORMATS } from '../../data/cinemas.js';
import { GENRES, LANGUAGES, RATINGS } from '../../data/movies.js';
import { isEmail } from '../../utils/validators.js';

const PAGE = 8;
const TABS = [['', 'All films'], ['now_showing', 'Now showing'], ['coming_soon', 'Coming soon']];

export default function MoviesPage() {
  const [f, set, reset] = useQueryState({ q: '', genre: '', format: '', language: '', rating: '', sort: 'popularity', status: '', page: '1' });
  useDocTitle(f.status === 'coming_soon' ? 'Coming soon' : 'Explore movies');
  const toast = useToast();
  const [text, setText] = useState(f.q); const dq = useDebounce(text, 250);
  useEffect(() => { if (dq !== f.q) set({ q: dq, page: '1' }); }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setText(f.q); }, [f.q]);

  const { data, loading, error, reload } = useAsync(() => movieService.list({ search: f.q, genre: f.genre, format: f.format, language: f.language, rating: f.rating, sort: f.sort, status: f.status }), [f.q, f.genre, f.format, f.language, f.rating, f.sort, f.status]);
  const next = useAsync(() => showtimeService.nextByMovie(), []);
  const movies = data || [];
  const page = Math.min(Number(f.page) || 1, Math.max(1, Math.ceil(movies.length / PAGE)));
  const { rows, pages } = useMemo(() => paginate(movies, page, PAGE), [movies, page]);
  const active = [['genre', f.genre && `Genre: ${f.genre}`], ['format', f.format && `Format: ${f.format}`], ['language', f.language && `Language: ${f.language}`], ['rating', f.rating && `Rated: ${f.rating}`], ['q', f.q && `Search: “${f.q}”`]].filter(([, v]) => v);
  const change = (k) => (e) => set({ [k]: e.target.value, page: '1' });

  const [email, setEmail] = useState(''); const [err, setErr] = useState('');
  const alert = (e) => { e.preventDefault(); if (!isEmail(email)) return setErr('Enter a valid email address'); setErr(''); setEmail(''); toast.success('You’re on the list for premiere alerts.'); };

  return (
    <div className="px-margin-mobile md:px-margin py-8 max-w-[1600px] mx-auto">
      <p className="label-caps text-secondary flex items-center gap-2"><Film className="w-4 h-4" aria-hidden />Curated theatrical lineup</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white">{f.status === 'coming_soon' ? 'Coming Soon' : 'Explore Movies'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant max-w-xl">Browse movies currently showing in theaters and upcoming blockbuster premieres with immersive IMAX 70mm and Dolby Atmos sound stages.</p></div>
        <span className="chip bg-surface-container-low border border-white/5 text-on-surface"><span className="w-2 h-2 rounded-full bg-emerald-400" />18 Auditoriums Active <span className="text-on-surface-variant font-normal">New York Central</span></span></div>

      <SearchInput className="mt-6" value={text} onChange={setText} placeholder="Search by movie title, director, or actor…" label="Search movies" shortcut />
      <div role="tablist" aria-label="Release status" className="mt-4 inline-flex rounded-full bg-surface-container-low p-1 border border-white/5">{TABS.map(([v, l]) => <button key={l} role="tab" aria-selected={f.status === v} onClick={() => set({ status: v, page: '1' })} className={`rounded-full px-4 py-1.5 text-label-md transition-colors ${f.status === v ? 'bg-primary-container text-white shadow-glow' : 'text-on-surface-variant hover:text-white'}`}>{l}</button>)}</div>

      <div className="mt-4 panel p-4 md:p-5">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <Select label="Genre" value={f.genre} onChange={change('genre')}><option value="">All Genres</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</Select>
          <Select label="Experience / Format" value={f.format} onChange={change('format')}><option value="">All Formats</option>{FORMATS.map((g) => <option key={g}>{g}</option>)}</Select>
          <Select label="Language" value={f.language} onChange={change('language')}><option value="">All Languages</option>{LANGUAGES.map((g) => <option key={g}>{g}</option>)}</Select>
          <Select label="Age rating" value={f.rating} onChange={change('rating')}><option value="">All Ratings</option>{RATINGS.map((g) => <option key={g}>{g}</option>)}</Select>
          <Select label="Sort by" value={f.sort} onChange={change('sort')}>{SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          <Button variant="secondary" icon={RotateCcw} onClick={() => { reset(); setText(''); }} className="col-span-2 lg:col-span-1">Reset</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-label-sm" aria-live="polite">
          {active.length > 0 && <span className="text-on-surface-variant">Active:</span>}
          {active.map(([k, label]) => <button key={k} onClick={() => { set({ [k]: '', page: '1' }); if (k === 'q') setText(''); }} aria-label={`Remove filter ${label}`} className="chip bg-surface-container-high text-on-surface hover:bg-surface-container-highest">{label}<X className="w-3 h-3" aria-hidden /></button>)}
          {active.length > 0 && <button onClick={() => { reset(); setText(''); }} className="text-primary underline">Clear all</button>}
          <span className="ml-auto text-on-surface-variant">{loading ? 'Loading…' : <>Showing <b className="text-white">{movies.length}</b> {movies.length === 1 ? 'movie' : 'movies'}</>}</span>
        </div>
      </div>

      <div className="mt-6">
        {error ? <ErrorState onRetry={reload} /> : loading && !data ? <MovieGridSkeleton /> : movies.length === 0 ? (
          <EmptyState title="No movies match your search" message="Try removing a filter or searching by a different title, director or actor." action={<Button onClick={() => { reset(); setText(''); }} icon={RotateCcw}>Clear all filters</Button>} />
        ) : (
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-gutter-mobile md:gap-gutter transition-opacity ${loading ? 'opacity-60' : ''}`}>{rows.map((m) => <MovieCard key={m.id} movie={m} next={next.data?.[m.id]} />)}</div>)}
      </div>

      {movies.length > 0 && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-body-sm text-on-surface-variant"><span>Showing <b className="text-white">{(page - 1) * PAGE + 1}–{Math.min(page * PAGE, movies.length)}</b> of <b className="text-white">{movies.length}</b> movies</span><Pagination page={page} pages={pages} onChange={(p) => { set({ page: String(p) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></div>}

      <section className="mt-12 card p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
        <div><span className="chip bg-primary-container/20 text-[#ff8a80]">CineBook Advance Screening Access</span><h2 className="mt-3 font-headline text-headline-md text-white">Never Miss a Midnight Premiere</h2><p className="mt-1 text-body-md text-on-surface-variant">Receive instant alerts when 70mm IMAX and opening night Dolby Cinema tickets drop. VIP members get 2-hour priority reservation windows.</p></div>
        <form onSubmit={alert} noValidate className="flex flex-col sm:flex-row gap-2 items-start"><Field className="flex-1 w-full" aria-label="Email for alerts" icon={Mail} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} error={err} placeholder="Enter your email…" /><Button type="submit" className="!py-3 shrink-0">Get Alerts</Button></form>
      </section>
    </div>
  );
}
