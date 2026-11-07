import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import { SearchInput } from '../common/Field.jsx';
import { EmptyState } from '../common/States.jsx';
import Poster from '../common/Poster.jsx';
import { movieService } from '../../services/movieService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { duration } from '../../utils/format.js';

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState(''); const dq = useDebounce(q, 200);
  const { data, loading } = useAsync(() => (dq.trim() ? movieService.list({ search: dq, sort: 'popularity' }) : movieService.list({ sort: 'popularity' }).then((l) => l.slice(0, 4))), [dq, open]);
  const rows = data || [];
  return (
    <Modal open={open} onClose={onClose} title="Search CineBook" description="Find movies by title, director, actor or genre.">
      <SearchInput value={q} onChange={setQ} autoFocus label="Search movies" placeholder="Search by movie title, director, or actor…" />
      <p className="mt-4 mb-2 label-caps text-on-surface-variant">{dq.trim() ? `${rows.length} result${rows.length === 1 ? '' : 's'}` : 'Trending now'}</p>
      {!loading && rows.length === 0 ? <EmptyState title={`No results for “${dq}”`} message="Check the spelling or try a genre like Sci-Fi or Thriller." /> : (
        <ul className="space-y-1" aria-live="polite">{rows.map((m) => (
          <li key={m.id}><Link to={`/movies/${m.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-xl p-2 hover:bg-white/5">
            <Poster src={m.poster} title={m.title} className="w-12 shrink-0" />
            <div className="min-w-0"><p className="text-title-md text-white truncate">{m.title}</p><p className="text-body-sm text-on-surface-variant truncate">{m.genres.join(' • ')} • {duration(m.runtime)} • {m.rating}</p></div>
          </Link></li>))}</ul>)}
    </Modal>
  );
}
