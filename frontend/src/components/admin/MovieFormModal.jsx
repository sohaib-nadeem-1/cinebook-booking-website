import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { Field, Select, Textarea } from '../common/Field.jsx';
import { FORMATS } from '../../data/cinemas.js';
import { GENRES, LANGUAGES, MOVIE_STATUS, RATINGS } from '../../data/movies.js';
import { movieService } from '../../services/movieService.js';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { title: '', genres: [], runtime: '', releaseDate: '', rating: 'PG-13', formats: [], status: 'coming_soon', director: '', language: 'English', poster: '', synopsis: '' };

function Chips({ label, options, value, onChange, error }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <fieldset><legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-2">{options.map((o) => <button type="button" key={o} aria-pressed={value.includes(o)} onClick={() => toggle(o)} className={`rounded-full px-3 py-1 text-label-sm font-semibold border transition-colors ${value.includes(o) ? 'bg-primary-container border-primary-container text-white' : 'border-white/10 text-on-surface-variant hover:text-white hover:bg-white/5'}`}>{o}</button>)}</div>
      {error && <p role="alert" className="mt-1.5 text-body-sm text-error">{error}</p>}</fieldset>
  );
}

/** Add / edit movie. Prepopulates when `movie` is provided; validation errors come from movieService. */
export default function MovieFormModal({ open, movie, onClose, onSaved }) {
  const toast = useToast(); const editing = !!movie;
  const [f, setF] = useState(EMPTY); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setF(movie ? { ...EMPTY, ...movie, runtime: String(movie.runtime), poster: movie.poster || '' } : EMPTY); setErrors({}); } }, [open, movie]);
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); };
  const setV = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); setErrors((x) => ({ ...x, [k]: '' })); };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { ...f, poster: f.poster.trim() || null, backdrop: f.poster.trim() || movie?.backdrop || null, badge: f.formats[0] };
      const saved = editing ? await movieService.update(movie.id, payload) : await movieService.create(payload);
      toast.success(editing ? `“${saved.title}” updated successfully` : 'Movie added successfully'); onSaved(saved, editing);
    } catch (err) { if (err.errors) { setErrors(err.errors); toast.error('Please fix the highlighted fields.'); } else toast.error('Unable to complete this action'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} dismissable={!busy} size="lg" title={editing ? `Edit ${movie.title}` : 'Add movie'} description="Catalog details shown on the customer site." footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="movie-form" loading={busy} loadingText="Saving…">{editing ? 'Save changes' : 'Add movie'}</Button></>}>
      <form id="movie-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
        <Field className="sm:col-span-2" label="Title" value={f.title} onChange={set('title')} error={errors.title} required data-autofocus />
        <Field label="Runtime (minutes)" type="number" min="30" max="360" value={f.runtime} onChange={set('runtime')} error={errors.runtime} required />
        <Field label="Release date" type="date" value={f.releaseDate} onChange={set('releaseDate')} error={errors.releaseDate} required />
        <Select label="Age rating" value={f.rating} onChange={set('rating')} error={errors.rating}>{RATINGS.map((r) => <option key={r}>{r}</option>)}</Select>
        <Select label="Status" value={f.status} onChange={set('status')}>{Object.entries(MOVIE_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}</Select>
        <Field label="Director" value={f.director} onChange={set('director')} />
        <Select label="Language" value={f.language} onChange={set('language')}>{LANGUAGES.map((r) => <option key={r}>{r}</option>)}</Select>
        <div className="sm:col-span-2"><Chips label="Genres" options={GENRES} value={f.genres} onChange={setV('genres')} error={errors.genres} /></div>
        <div className="sm:col-span-2"><Chips label="Formats" options={FORMATS} value={f.formats} onChange={setV('formats')} error={errors.formats} /></div>
        <Field className="sm:col-span-2" label="Poster image URL (optional)" type="url" value={f.poster} onChange={set('poster')} placeholder="https://…" hint="Leave empty to use a generated placeholder poster." />
        <Textarea className="sm:col-span-2" label="Synopsis" value={f.synopsis} onChange={set('synopsis')} />
      </form>
    </Modal>
  );
}
