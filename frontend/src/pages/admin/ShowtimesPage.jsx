
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Banknote,
  Gauge,
  Armchair,
  ShieldCheck,
} from 'lucide-react';

import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination, { paginate } from '../../components/common/Pagination.jsx';
import Poster from '../../components/common/Poster.jsx';
import Progress from '../../components/common/Progress.jsx';
import Button from '../../components/common/Button.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import { ConfirmDialog } from '../../components/common/Modal.jsx';
import { Field, Select, SearchInput } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState } from '../../components/common/States.jsx';

import {
  showtimeService,
  findConflict,
  CONFLICT_MESSAGE,
} from '../../services/showtimeService.js';

import { movieService } from '../../services/movieService.js';
import { readSettings } from '../../services/settingsService.js';
import { logAudit } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryState } from '../../hooks/useQueryState.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';

import {
  AUDITORIUMS,
  CINEMAS,
  FORMATS,
} from '../../data/cinemas.js';

import { profileCapacity, tierPrices } from '../../data/seats.js';

import {
  addDays,
  dayShort,
  duration,
  formatDate,
  fromMinutes,
  money,
  time12,
  toMinutes,
  todayKey,
} from '../../utils/format.js';

const FMT_CHIPS = [
  ['', 'All Formats'],
  ['IMAX 70MM', 'IMAX 70mm'],
  ['DOLBY CINEMA', 'Dolby Cinema'],
  ['VIP LOUNGE', 'VIP Lounge'],
];

const EMPTY = {
  movieId: '',
  cinemaId: 'c1',
  auditoriumId: 'a1',
  date: todayKey(),
  start: '18:00',
  end: '',
  price: '24.50',
  format: 'IMAX 70MM',
};

// ==========================================
// SHOWTIME FORM
// ==========================================

function ShowtimeForm({ initial, movies, onClose, onSaved }) {
  const toast = useToast();

  const editing = !!initial?.id;

  const turnaround = readSettings().system.turnaroundMinutes;

  const [f, setF] = useState(() => ({
    ...EMPTY,
    movieId: movies[0]?.id || '',
    ...initial,
  }));

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Conflict checking state
  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const endTouched = useRef(!!initial?.id);

  const auds = AUDITORIUMS.filter(
    (a) => a.cinemaId === f.cinemaId
  );

  const aud = AUDITORIUMS.find(
    (a) => a.id === f.auditoriumId
  );

  const movie = movies.find(
    (m) => m.id === f.movieId
  );

  // Auto-fill end time using movie runtime
  useEffect(() => {
    if (!endTouched.current && movie && f.start) {
      setF((current) => ({
        ...current,
        end: fromMinutes(
          toMinutes(current.start) + movie.runtime
        ),
      }));
    }
  }, [f.start, f.movieId, movie]);

  // ==========================================
  // ASYNC CONFLICT CHECK
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const checkConflict = async () => {
      if (
        !f.auditoriumId ||
        !f.date ||
        !f.start ||
        !f.end ||
        f.end <= f.start
      ) {
        setConflict(null);
        setCheckingConflict(false);
        return;
      }

      setCheckingConflict(true);
      setConflict(null);

      try {
        const result = await findConflict(
          {
            ...f,
            auditoriumId: f.auditoriumId,
          },
          initial?.id ?? null
        );

        if (!cancelled) {
          setConflict(result);
        }
      } catch (error) {
        if (!cancelled) {
          setConflict(null);
          console.error('Conflict check failed:', error);
        }
      } finally {
        if (!cancelled) {
          setCheckingConflict(false);
        }
      }
    };

    checkConflict();

    return () => {
      cancelled = true;
    };
  }, [
    f.auditoriumId,
    f.date,
    f.start,
    f.end,
    initial?.id,
  ]);

  // ==========================================
  // FORM INPUT HANDLER
  // ==========================================

  const set = (key) => (event) => {
    const value = event.target.value;

    if (key === 'end') {
      endTouched.current = true;
    }

    setF((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === 'cinemaId') {
        const auditorium = AUDITORIUMS.find(
          (item) => item.cinemaId === value
        );

        if (auditorium) {
          next.auditoriumId = auditorium.id;
          next.format = auditorium.format;
        }
      }

      if (key === 'auditoriumId') {
        const auditorium = AUDITORIUMS.find(
          (item) => item.id === value
        );

        if (auditorium) {
          next.format = auditorium.format;
        }
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [key]: '',
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (event) => {
    event.preventDefault();

    if (checkingConflict) {
      return toast.info(
        'Please wait while we check showtime availability.'
      );
    }

    if (conflict) {
      return toast.error(CONFLICT_MESSAGE);
    }

    setBusy(true);

    try {
      const result = editing
        ? await showtimeService.update(initial.id, f)
        : await showtimeService.create(f);

      toast.success(
        editing
          ? 'Showtime updated successfully'
          : 'Showtime scheduled successfully'
      );

      onSaved(result, editing);
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }

      toast.error(
        error.code === 'CONFLICT'
          ? CONFLICT_MESSAGE
          : error.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="panel p-5 md:p-6 mb-gutter-mobile border-primary-container/30"
      aria-labelledby="sf-t"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-container/15 grid place-items-center">
            <CalendarDays className="w-5 h-5 text-[#ff8a80]" />
          </span>

          <div>
            <h2
              id="sf-t"
              className="font-headline text-headline-sm text-white"
            >
              {editing ? 'Edit Showtime' : 'Schedule New Showtime'}
            </h2>

            <p className="text-body-sm text-on-surface-variant">
              Configure screening slots, allocate auditoriums,
              and verify inter-feature turnaround windows.
            </p>
          </div>
        </div>

        <IconButton
          icon={X}
          label="Close form"
          onClick={onClose}
        />
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="mt-5 grid md:grid-cols-2 xl:grid-cols-6 gap-4"
      >
        <Select
          className="xl:col-span-3"
          label="Select movie & master format"
          value={f.movieId}
          onChange={set('movieId')}
          error={errors.movieId}
        >
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title} ({movie.formats[0]} • {movie.runtime} min • {movie.rating})
            </option>
          ))}
        </Select>

        <Select
          className="xl:col-span-3"
          label="Cinema complex"
          value={f.cinemaId}
          onChange={set('cinemaId')}
        >
          {CINEMAS.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name} — {cinema.short}
            </option>
          ))}
        </Select>

        <Select
          className="xl:col-span-3"
          label="Auditorium / hall spec"
          value={f.auditoriumId}
          onChange={set('auditoriumId')}
          error={errors.auditoriumId}
        >
          {auds.map((auditorium) => (
            <option key={auditorium.id} value={auditorium.id}>
              {auditorium.name} ({auditorium.spec})
            </option>
          ))}
        </Select>

        <Field
          className="xl:col-span-2"
          label="Screening date"
          type="date"
          value={f.date}
          onChange={set('date')}
          error={errors.date}
        />

        <div className="xl:col-span-1">
          <span className="field-label">Capacity</span>

          <div className="field flex items-center gap-2 !bg-surface-container">
            <Armchair className="w-4 h-4 text-secondary" />
            <b className="text-secondary">
              {aud ? profileCapacity(aud.profile) : '—'} seats
            </b>
          </div>
        </div>

        <Field
          className="xl:col-span-2"
          label="Start time"
          type="time"
          value={f.start}
          onChange={set('start')}
          error={errors.start && errors.start !== CONFLICT_MESSAGE ? errors.start : ''}
        />

        <Field
          className="xl:col-span-2"
          label={`End time (+${turnaround}m turnaround)`}
          type="time"
          value={f.end}
          onChange={set('end')}
          error={errors.end}
          hint={movie ? `Runtime ${duration(movie.runtime)}` : undefined}
        />

        <Field
          className="xl:col-span-1"
          label="Base prime price ($)"
          type="number"
          step="0.5"
          min="1"
          value={f.price}
          onChange={set('price')}
          error={errors.price}
        />

        <Select
          className="xl:col-span-1"
          label="Format"
          value={f.format}
          onChange={set('format')}
        >
          {FORMATS.map((format) => (
            <option key={format}>{format}</option>
          ))}
        </Select>

        {/* Conflict status */}
        <div className="md:col-span-2 xl:col-span-6">
          {checkingConflict ? (
            <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Clock className="w-4 h-4 animate-pulse" />
              Checking auditorium availability...
            </p>
          ) : conflict ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-error/40 bg-error-container/25 px-4 py-3 text-body-sm text-on-error-container"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />

              <div>
                <b>{CONFLICT_MESSAGE}</b>

                <p className="opacity-80">
                  Clashes with {time12(conflict.start)}–{time12(conflict.end)}
                  {' '}on {formatDate(conflict.date)}
                  {' '}(incl. {turnaround}-minute cleaning buffer).
                  Pick another time or hall.
                </p>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-body-sm text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              No conflicts. Prices: Standard {money(tierPrices(Number(f.price) || 0).standard)}
              {' '}• Prime {money(Number(f.price) || 0)}
              {' '}• VIP {money(tierPrices(Number(f.price) || 0).vip)}
            </p>
          )}
        </div>

        <div className="md:col-span-2 xl:col-span-6 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            icon={Save}
            loading={busy || checkingConflict}
            loadingText={checkingConflict ? 'Checking...' : 'Saving…'}
            disabled={!!conflict || checkingConflict}
          >
            {editing ? 'Save showtime' : 'Confirm showtime'}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ==========================================
// ADMIN SHOWTIMES PAGE
// ==========================================

export default function AdminShowtimesPage() {
  useDocTitle('Showtimes management');

  const { admin } = useAuth();
  const toast = useToast();

  const [f, set, reset] = useQueryState({
    q: '',
    cinema: '',
    date: todayKey(),
    fmt: '',
    rows: '5',
    page: '1',
  });

  const [text, setText] = useState(f.q);
  const dq = useDebounce(text, 250);

  useEffect(() => {
    if (dq !== f.q) {
      set({ q: dq, page: '1' });
    }
  }, [dq]); // eslint-disable-line

  useEffect(() => {
    setText(f.q);
  }, [f.q]);

  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const all = useAsync(
    () => showtimeService.list({}),
    []
  );

  const movies = useAsync(
    () => movieService.list({ scope: 'admin' }),
    []
  );

  const rowsPer = Number(f.rows) || 5;

  const list = useMemo(
    () =>
      (all.data || []).filter(
        (showtime) =>
          (!f.cinema || String(showtime.cinemaId) === String(f.cinema)) &&
          (!f.date || f.date === 'all' || showtime.date === f.date) &&
          (!f.fmt || showtime.format === f.fmt) &&
          (!f.q ||
            `${showtime.movie?.title || ''} ${showtime.auditorium?.name || ''} ${showtime.cinema?.short || ''}`
              .toLowerCase()
              .includes(f.q.toLowerCase()))
      ),
    [all.data, f]
  );

  const page = Math.min(
    Number(f.page) || 1,
    Math.max(1, Math.ceil(list.length / rowsPer))
  );

  const { rows, pages } = paginate(list, page, rowsPer);

  const today = (all.data || []).filter(
    (showtime) => showtime.date === todayKey()
  );

  const avg = today.length
    ? Math.round(
        today.reduce(
          (total, showtime) => total + (Number(showtime.soldPct) || 0),
          0
        ) / today.length
      )
    : 0;

  const pace = today.reduce(
    (total, showtime) =>
      total +
      (Number(showtime.price) || 0) *
        ((Number(showtime.capacity) || 0) -
          (Number(showtime.seatsLeft) || 0)),
    0
  );

  // Calculate conflicts synchronously from already-loaded real showtimes.
  // Do NOT call async findConflict() inside Array.filter().
  const turnaround = readSettings().system.turnaroundMinutes;

  const conflicts = useMemo(() => {
    const shows = all.data || [];
    const conflictingIds = new Set();

    for (let i = 0; i < shows.length; i += 1) {
      for (let j = i + 1; j < shows.length; j += 1) {
        const first = shows[i];
        const second = shows[j];

        if (
          String(first.auditoriumId) !== String(second.auditoriumId) ||
          first.date !== second.date
        ) {
          continue;
        }

        const firstStart = toMinutes(first.start);
        const firstEnd = toMinutes(first.end);
        const secondStart = toMinutes(second.start);
        const secondEnd = toMinutes(second.end);

        const overlap =
          firstStart < secondEnd + turnaround &&
          firstEnd + turnaround > secondStart;

        if (overlap) {
          conflictingIds.add(first.id);
          conflictingIds.add(second.id);
        }
      }
    }

    return conflictingIds.size;
  }, [all.data, turnaround]);

  const dates = Array.from(
    { length: 4 },
    (_, index) => addDays(todayKey(), index)
  );

  const formRef = useRef(null);

  const open = (value) => {
    setForm(value);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const remove = async () => {
    setDelBusy(true);

    try {
      const result = await showtimeService.remove(del.id);

      logAudit(
        admin.name,
        `Deleted showtime ${del.movie.title} ${del.date} ${del.start}`
      );

      toast.success(
        result.refunded
          ? `Showtime deleted. ${result.refunded} booking(s) were refunded (demo).`
          : 'Showtime deleted successfully'
      );

      setDel(null);
      all.reload(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDelBusy(false);
    }
  };

  const clear = () => {
    reset();
    setText('');
  };

  if (all.error) {
    return <ErrorState onRetry={all.reload} />;
  }

  const cols = [
    {
      key: 'm',
      header: 'Movie & Rating',
      render: (showtime) => (
        <div className="flex items-center gap-3">
          <Poster
            src={showtime.movie?.poster}
            title={showtime.movie?.title}
            className="w-10 shrink-0"
          />

          <div>
            <p className="font-headline text-title-md text-white leading-tight">
              {showtime.movie?.title || 'Movie unavailable'}
              <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] align-middle">
                {showtime.movie?.rating || '—'}
              </span>
            </p>

            <p className="text-label-sm text-on-surface-variant">
              {showtime.movie?.director || 'TBA'} • {showtime.movie?.runtime || '—'} min
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'h',
      header: 'Hall & Format',
      render: (showtime) => (
        <>
          <p className="text-white">
            {showtime.auditorium?.name || 'Hall unavailable'}
            <span className="text-on-surface-variant">
              {' '}• {showtime.cinema?.short || 'Cinema unavailable'}
            </span>
          </p>

          <p className="text-label-sm text-[#ff8a80] font-semibold">
            {showtime.format} — {showtime.auditorium?.spec || ''}
          </p>
        </>
      ),
    },
    {
      key: 'w',
      header: 'Screening window',
      render: (showtime) => (
        <>
          <p className="text-white font-semibold whitespace-nowrap">
            {time12(showtime.start)} – {time12(showtime.end)}
          </p>

          <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(showtime.date)}
          </p>
        </>
      ),
    },
    {
      key: 'p',
      header: 'Dynamic pricing',
      render: (showtime) => (
        <>
          <p className="text-white">
            <b>{money(showtime.price)}</b>
            <span className="text-secondary text-label-sm"> Prime</span>
          </p>

          <p className="text-label-sm text-on-surface-variant">
            {money(tierPrices(showtime.price).standard)} Standard
          </p>
        </>
      ),
    },
    {
      key: 'o',
      header: 'Occupancy / capacity',
      className: 'min-w-[170px]',
      render: (showtime) => (
        <div>
          <div className="flex justify-between text-label-sm">
            <b className="text-white">
              {showtime.seatsLeft ?? '—'} / {showtime.capacity ?? '—'} left
            </b>

            <span
              className={
                showtime.soldPct > 85
                  ? 'text-[#ff8a80]'
                  : 'text-on-surface-variant'
              }
            >
              {showtime.soldPct ?? '—'}% full
            </span>
          </div>

          <Progress
            value={showtime.soldPct || 0}
            className="mt-1.5"
            label={`${showtime.movie?.title || 'Showtime'} occupancy`}
          />
        </div>
      ),
    },
    {
      key: 'a',
      header: 'Actions',
      headerClass: 'text-right',
      render: (showtime) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Pencil}
            label={`Edit showtime ${showtime.movie?.title || ''} ${time12(showtime.start)}`}
            onClick={() => open({ ...showtime })}
          />

          <IconButton
            icon={Trash2}
            tone="danger"
            label={`Delete showtime ${showtime.movie?.title || ''} ${time12(showtime.start)}`}
            onClick={() => setDel(showtime)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Auditorium dispatch • Live scheduling"
        title="Showtimes Management"
        description="Schedule auditoriums, configure screen slots, coordinate laser projector turnarounds, and adjust ticket pricing."
      >
        <Button icon={Plus} onClick={() => open({})}>
          Add Showtime
        </Button>
      </AdminPageHeader>

      <section
        aria-label="Showtime metrics"
        className="grid sm:grid-cols-2 xl:grid-cols-4 gap-gutter-mobile md:gap-gutter mb-gutter"
      >
        <StatCard
          label="Scheduled today"
          value={`${today.length} Slots`}
          icon={Clock}
          sub="Across all complexes"
        />

        <StatCard
          label="Avg circuit occupancy"
          value={`${avg}%`}
          icon={Gauge}
          sub="Today's screenings"
        />

        <StatCard
          label="Prime box office pace"
          value={money(pace)}
          icon={Banknote}
          tone="gold"
          sub="Today's projected gate"
        />

        <StatCard
          label="Screen conflicts"
          value={`${conflicts} Flagged`}
          icon={ShieldCheck}
          sub={conflicts ? 'Review overlapping halls' : 'Turnarounds synchronized'}
        />
      </section>

      <div ref={formRef}>
        {form && movies.data && (
          <ShowtimeForm
            key={form.id || 'new'}
            initial={form}
            movies={(movies.data || []).filter(
              (movie) => movie.status !== 'archived'
            )}
            onClose={() => setForm(null)}
            onSaved={() => {
              setForm(null);
              all.reload(true);
            }}
          />
        )}
      </div>

      <div className="panel p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            className="flex-1 min-w-[220px]"
            value={text}
            onChange={setText}
            placeholder="Search by movie, hall or cinema…"
            label="Search showtimes"
          />

          <div
            role="group"
            aria-label="Cinema"
            className="flex flex-wrap items-center gap-1.5"
          >
            <span className="label-caps text-on-surface-variant mr-1">
              Location:
            </span>

            {[{ id: '', short: 'All Cinemas' }, ...CINEMAS].map((cinema) => (
              <button
                key={cinema.id}
                aria-pressed={f.cinema === cinema.id}
                onClick={() => set({ cinema: cinema.id, page: '1' })}
                className={`rounded-lg px-3 py-1.5 text-label-sm font-semibold ${
                  f.cinema === cinema.id
                    ? 'bg-white/15 text-white'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-white'
                }`}
              >
                {cinema.short}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Date"
            className="flex flex-wrap items-center gap-1.5"
          >
            {dates.map((date, index) => (
              <button
                key={date}
                role="tab"
                aria-selected={f.date === date}
                onClick={() => set({ date, page: '1' })}
                className={`rounded-lg px-3 py-1.5 text-center ${
                  f.date === date
                    ? 'bg-primary-container text-white shadow-glow'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="block text-label-sm font-bold">
                  {index === 0
                    ? 'Today'
                    : index === 1
                      ? 'Tomorrow'
                      : dayShort(date)}
                </span>

                <span className="block text-[10px] opacity-80">
                  {formatDate(date)}
                </span>
              </button>
            ))}

            <input
              type="date"
              aria-label="Pick a date"
              value={f.date === 'all' ? '' : f.date}
              onChange={(event) =>
                event.target.value &&
                set({ date: event.target.value, page: '1' })
              }
              className="field !w-auto !py-2"
            />

            <button
              onClick={() => set({ date: 'all', page: '1' })}
              aria-pressed={f.date === 'all'}
              className={`rounded-lg px-3 py-2 text-label-sm font-semibold ${
                f.date === 'all'
                  ? 'bg-white/15 text-white'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-white'
              }`}
            >
              All dates
            </button>
          </div>

          <div
            role="group"
            aria-label="Format"
            className="flex flex-wrap gap-1.5 ml-auto"
          >
            {FMT_CHIPS.map(([value, label]) => (
              <button
                key={label}
                aria-pressed={f.fmt === value}
                onClick={() => set({ fmt: value, page: '1' })}
                className={`rounded-full px-3.5 py-1.5 text-label-sm font-semibold ${
                  f.fmt === value
                    ? 'bg-white/15 text-white'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p
          className="text-label-sm text-on-surface-variant"
          aria-live="polite"
        >
          Showing <b className="text-white">{list.length}</b> of{' '}
          {(all.data || []).length} screen runs
        </p>
      </div>

      <div className="mt-4 panel overflow-hidden">
        <DataTable
          caption="Showtimes"
          columns={cols}
          rows={rows}
          loading={all.loading && !all.data}
          minWidth={1000}
          empty={
            <EmptyState
              icon={Clock}
              title="No showtimes match"
              message="Try another date, cinema or format — or schedule a new showtime."
              action={
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={clear}>
                    Clear filters
                  </Button>

                  <Button icon={Plus} onClick={() => open({})}>
                    Add showtime
                  </Button>
                </div>
              }
            />
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-3">
            <label htmlFor="rpp">Rows per page:</label>

            <select
              id="rpp"
              value={f.rows}
              onChange={(event) =>
                set({ rows: event.target.value, page: '1' })
              }
              className="field !w-auto !py-1.5"
            >
              {['5', '10', '25'].map((number) => (
                <option key={number}>{number}</option>
              ))}
            </select>

            <span>
              {list.length
                ? `${(page - 1) * rowsPer + 1}–${Math.min(page * rowsPer, list.length)} of ${list.length}`
                : '0 showtimes'}
            </span>
          </div>

          <Pagination
            page={page}
            pages={pages}
            onChange={(nextPage) =>
              set({ page: String(nextPage) })
            }
            edges
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={remove}
        loading={delBusy}
        danger
        title="Delete this showtime?"
        confirmText="Delete showtime"
        message={
          del &&
          `${del.movie?.title || 'Movie'} • ${del.auditorium?.name || 'Hall'} • ${formatDate(del.date)} ${time12(del.start)}. Any active bookings for this show will be refunded automatically (demo). This can't be undone.`
        }
      />
    </div>
  ); 
}

