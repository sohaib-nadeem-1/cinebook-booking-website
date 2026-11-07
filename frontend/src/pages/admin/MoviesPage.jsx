import { useEffect, useState } from 'react';
import { Download, Film, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import MovieFormModal from '../../components/admin/MovieFormModal.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination, { paginate } from '../../components/common/Pagination.jsx';
import Poster from '../../components/common/Poster.jsx';
import Badge, { STATUS_TONE } from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import { ConfirmDialog } from '../../components/common/Modal.jsx';
import { Select, SearchInput } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState } from '../../components/common/States.jsx';
import { movieService } from '../../services/movieService.js';
import { logAudit } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryState } from '../../hooks/useQueryState.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { GENRES, MOVIE_STATUS } from '../../data/movies.js';
import { downloadCsv } from '../../utils/csv.js';
import { formatDate, duration } from '../../utils/format.js';

const PER = 8;

export default function AdminMoviesPage() {
  useDocTitle('Movies management');
  const { admin, can } = useAuth();
  const toast = useToast();
  const [f, set, reset] = useQueryState({ q: '', status: '', genre: '', page: '1' });
  const [text, setText] = useState(f.q);
  const dq = useDebounce(text, 250);
  useEffect(() => { if (dq !== f.q) set({ q: dq, page: '1' }); }, [dq]); // eslint-disable-line
  useEffect(() => { setText(f.q); }, [f.q]);

  const { data, loading, error, reload } = useAsync(
    () => movieService.list({ scope: 'admin', search: f.q, status: f.status, genre: f.genre, sort: 'newest' }),
    [f.q, f.status, f.genre],
  );
  const [form, setForm] = useState({ open: false, movie: null });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = data || [];
  const page = Math.min(Number(f.page) || 1, Math.max(1, Math.ceil(list.length / PER)));
  const { rows, pages } = paginate(list, page, PER);

  const remove = async () => {
    setBusy(true);
    try {
      await movieService.remove(del.id);
      logAudit(admin?.name, `Deleted movie ${del.title}`);
      toast.success(`“${del.title}” deleted`);
      setDel(null);
      reload(true);
    } catch (e) {
      toast.error(e.message || 'Unable to delete this movie');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () =>
    downloadCsv('cinebook-movies.csv', list.map((m) => ({
      title: m.title,
      status: MOVIE_STATUS[m.status]?.label || m.status,
      rating: m.rating,
      runtime: m.runtime,
      release_date: m.releaseDate,
      language: m.language,
      genres: m.genres.join(' | '),
      formats: m.formats.join(' | '),
    })))
      ? toast.success(`Exported ${list.length} movies.`)
      : toast.warning('No movies to export.');

  const clear = () => { reset(); setText(''); };

  const cols = [
    {
      key: 'm',
      header: 'Movie',
      render: (m) => (
        <div className="flex items-center gap-3">
          <Poster src={m.poster} title={m.title} ratio="aspect-[2/3]" className="w-10 shrink-0" rounded="rounded-md" />
          <div className="min-w-0">
            <p className="text-white font-semibold">{m.title}</p>
            <p className="text-label-sm text-on-surface-variant">{m.director}</p>
          </div>
        </div>
      ),
    },
    { key: 'g', header: 'Genres', render: (m) => <span className="text-on-surface">{m.genres.join(', ') || '—'}</span> },
    { key: 'r', header: 'Rating', render: (m) => <Badge tone="slate">{m.rating}</Badge> },
    { key: 'd', header: 'Runtime', render: (m) => <span className="whitespace-nowrap">{duration(m.runtime)}</span> },
    { key: 'rd', header: 'Release', render: (m) => <span className="whitespace-nowrap">{m.releaseDate ? formatDate(m.releaseDate, { year: true }) : '—'}</span> },
    { key: 'f', header: 'Formats', render: (m) => <span className="text-on-surface">{m.formats.join(', ') || '—'}</span> },
    {
      key: 's',
      header: 'Status',
      render: (m) => <Badge tone={STATUS_TONE[m.status] || 'slate'} dot>{MOVIE_STATUS[m.status]?.label || m.status}</Badge>,
    },
    {
      key: 'a',
      header: 'Actions',
      headerClass: 'text-right',
      render: (m) => (
        <div className="flex justify-end gap-0.5">
          <IconButton icon={Pencil} label={`Edit ${m.title}`} onClick={() => setForm({ open: true, movie: m })} />
          {can('movies:delete') && <IconButton icon={Trash2} tone="danger" label={`Delete ${m.title}`} onClick={() => setDel(m)} />}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <div>
      <AdminPageHeader eyebrow="Catalog" title="Movies Management" description="Add, edit and retire the films shown across the CineBook circuit.">
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        <Button icon={Plus} onClick={() => setForm({ open: true, movie: null })}>Add Movie</Button>
      </AdminPageHeader>

      <div className="panel p-4 flex flex-wrap items-center gap-3">
        <SearchInput className="flex-1 min-w-[220px]" value={text} onChange={setText} placeholder="Search by title, director or genre…" label="Search movies" />
        <Select aria-label="Filter by status" value={f.status} onChange={(e) => set({ status: e.target.value, page: '1' })} className="w-48">
          <option value="">Status: All</option>
          {Object.entries(MOVIE_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
        </Select>
        <Select aria-label="Filter by genre" value={f.genre} onChange={(e) => set({ genre: e.target.value, page: '1' })} className="w-44">
          <option value="">Genre: All</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </Select>
        <IconButton icon={RefreshCw} label="Reset filters and refresh" onClick={() => { clear(); reload(); }} />
      </div>

      <div className="mt-4 panel overflow-hidden">
        <DataTable
          caption="Movies"
          columns={cols}
          rows={rows}
          loading={loading && !data}
          minWidth={980}
          empty={<EmptyState icon={Film} title="No movies found" message="No movies match your search or filters." action={<div className="flex gap-2"><Button variant="secondary" onClick={clear}>Clear filters</Button><Button icon={Plus} onClick={() => setForm({ open: true, movie: null })}>Add movie</Button></div>} />}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 text-body-sm text-on-surface-variant">
          <span>{list.length ? <>Showing <b className="text-white">{rows.length}</b> of <b className="text-white">{list.length}</b> movies</> : 'No movies'}</span>
          <Pagination page={page} pages={pages} onChange={(p) => set({ page: String(p) })} />
        </div>
      </div>

      <MovieFormModal
        open={form.open}
        movie={form.movie}
        onClose={() => setForm({ open: false, movie: null })}
        onSaved={(m, editing) => {
          logAudit(admin?.name, `${editing ? 'Edited' : 'Added'} movie ${m.title}`);
          setForm({ open: false, movie: null });
          reload(true);
        }}
      />
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={remove}
        loading={busy}
        danger
        title={`Delete ${del?.title}?`}
        confirmText="Delete movie"
        message="This permanently removes the movie from the catalog. This can’t be undone."
      />
    </div>
  );
}
