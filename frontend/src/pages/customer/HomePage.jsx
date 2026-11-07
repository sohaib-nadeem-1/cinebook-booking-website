import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Film,
  MapPin,
  PlayCircle,
  Star,
  Ticket,
  TrendingUp,
} from 'lucide-react';

import MovieCard from '../../components/movies/MovieCard.jsx';
import TrailerModal from '../../components/movies/TrailerModal.jsx';
import Poster from '../../components/common/Poster.jsx';
import Button from '../../components/common/Button.jsx';
import { Select } from '../../components/common/Field.jsx';
import { ErrorState, MovieGridSkeleton } from '../../components/common/States.jsx';

import { movieService } from '../../services/movieService.js';
import { showtimeService } from '../../services/showtimeService.js';

import { useAsync } from '../../hooks/useAsync.js';
import { usePrefs } from '../../context/PrefsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';

import { CINEMAS } from '../../data/cinemas.js';
import { addDays, dayNum, dayShort, duration, formatDate, todayKey } from '../../utils/format.js';

const CHIPS = ['All Formats', 'Action', 'Sci-Fi', 'Thriller', 'Animation', 'Drama'];
const QUICK_LABEL = ['Today', '', '', '', '', '', ''];

export default function HomePage() {
  useDocTitle();

  const nav = useNavigate();
  const toast = useToast();
  const { cinemaId } = usePrefs();

  const movies = useAsync(() => movieService.list({ sort: 'popularity' }), []);
  const next = useAsync(() => showtimeService.nextByMovie(), []);

  const [trailer, setTrailer] = useState(false);
  const [chip, setChip] = useState('All Formats');
  const [heroIdx, setHeroIdx] = useState(0);
  const [quick, setQuick] = useState({
    movie: '',
    cinema: cinemaId,
    date: todayKey(),
  });

  const [carousel, setCarousel] = useState(0);

  const all = movies.data || [];

  const showing = useMemo(
    () => all.filter((m) => m.status !== 'coming_soon'),
    [all]
  );

  const soon = useMemo(
    () => all.filter((m) => m.status === 'coming_soon'),
    [all]
  );

  const heroList = useMemo(
    () => showing.filter((m) => m.backdrop).slice(0, 4),
    [showing]
  );

  const hero =
    heroList[heroIdx % Math.max(1, heroList.length)] || showing[0];

  const grid = useMemo(
    () =>
      (
        chip === 'All Formats'
          ? showing
          : showing.filter((m) => m.genres.includes(chip))
      ).slice(0, 8),
    [showing, chip]
  );

  const trending = useMemo(
    () => showing.slice(0, 5),
    [showing]
  );

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(todayKey(), i)),
    []
  );

  useEffect(() => {
    setQuick((q) =>
      q.movie || !showing[0]
        ? q
        : { ...q, movie: showing[0].slug }
    );
  }, [showing]);

  useEffect(() => {
    setQuick((q) => ({ ...q, cinema: cinemaId }));
  }, [cinemaId]);

  useEffect(() => {
    if (heroList.length < 2) return undefined;

    const t = setInterval(
      () => setHeroIdx((i) => (i + 1) % heroList.length),
      9000
    );

    return () => clearInterval(t);
  }, [heroList.length]);

  const findShowtimes = () => {
    if (!quick.movie) {
      return toast.warning('Choose a movie first.');
    }

    nav(
      `/movies/${quick.movie}?date=${quick.date}&cinema=${quick.cinema}#showtimes`
    );
  };

  if (movies.error) {
    return <ErrorState onRetry={movies.reload} />;
  }

  const heroNext = hero && next.data?.[hero.id];

  return (
    <div>
      {/* Hero billboard */}
      <section
        className="relative -mt-16 md:-mt-20 overflow-hidden bg-surface-container-lowest"
        aria-label="Featured film"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/20 blur-[130px] pointer-events-none" />

        <div className="relative min-h-[620px] lg:min-h-[760px] flex items-end pb-24 pt-40 px-margin-mobile md:px-margin">
          {hero && (
            <div
              key={hero.id}
              className="absolute inset-0 bg-cover bg-center scale-105 animate-fade-in"
              style={{
                backgroundImage: hero.backdrop
                  ? `url(${hero.backdrop})`
                  : undefined,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-surface-container-lowest/80" />

          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

          {hero && (
            <div className="relative z-10 max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-primary-container text-white shadow-glow uppercase tracking-wider">
                  <Film className="w-4 h-4" aria-hidden />
                  {hero.badge} Exclusive
                </span>

                <span className="rounded-md bg-surface-container-high/90 px-2.5 py-1 text-label-sm">
                  {hero.rating}
                </span>

                <span className="chip bg-surface-container-high/90 text-secondary">
                  <Star className="w-3.5 h-3.5 fill-secondary" aria-hidden />
                  <b className="text-white">{hero.score}</b>
                  <span className="text-on-surface-variant font-normal">
                    ({hero.votes} verified)
                  </span>
                </span>

                <span className="text-label-sm text-on-surface-variant">
                  {duration(hero.runtime)}
                </span>
              </div>

              <div>
                <p className="label-caps text-secondary tracking-widest">
                  Now premiering worldwide
                </p>

                <h1 className="font-headline text-display-hero-mobile md:text-display-hero font-black uppercase text-white drop-shadow-2xl">
                  {hero.title.includes(':') ? (
                    <>
                      {hero.title.split(':')[0]}:{' '}
                      <span className="text-primary-container">
                        {hero.title.split(':').slice(1).join(':').trim()}
                      </span>
                    </>
                  ) : (
                    hero.title
                  )}
                </h1>
              </div>

              <p className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
                {hero.genres.map((g, i) => (
                  <span key={g} className="flex items-center gap-2">
                    <span className="text-on-surface font-medium">
                      {g}
                    </span>

                    {i < hero.genres.length - 1 && (
                      <span className="w-1 h-1 rounded-full bg-outline" />
                    )}
                  </span>
                ))}
              </p>

              <p className="text-body-lg text-on-surface max-w-2xl line-clamp-3">
                {hero.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/${hero.slug}#showtimes`}
                  className="btn-primary !px-8 !py-3.5 !text-title-md"
                >
                  <Ticket className="w-5 h-5" aria-hidden />
                  Book Tickets
                </Link>

                <Button
                  variant="secondary"
                  className="!px-7 !py-3.5"
                  icon={PlayCircle}
                  onClick={() => setTrailer(true)}
                >
                  Watch Trailer
                </Button>

                {heroNext && (
                  <span className="hidden sm:flex items-center gap-2 pl-3 text-label-sm text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Selling fast in {heroNext.auditorium?.spec.split(' ')[0] || 'IMAX'}
                  </span>
                )}
              </div>
            </div>
          )}

          {heroList.length > 1 && (
            <div className="absolute bottom-8 right-margin-mobile md:right-margin z-10 flex items-center gap-3">
              <div
                className="flex gap-2"
                role="tablist"
                aria-label="Featured films"
              >
                {heroList.map((m, i) => (
                  <button
                    key={m.id}
                    role="tab"
                    aria-selected={i === heroIdx % heroList.length}
                    aria-label={`Show ${m.title}`}
                    onClick={() => setHeroIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === heroIdx % heroList.length
                        ? 'w-10 bg-primary-container'
                        : 'w-2.5 bg-surface-variant hover:bg-surface-bright'
                    }`}
                  />
                ))}
              </div>

              <span className="hidden md:block text-label-sm text-on-surface-variant">
                {String((heroIdx % heroList.length) + 1).padStart(2, '0')} /{' '}
                {String(heroList.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Quick booking */}
      <section
        className="px-margin-mobile md:px-margin -mt-12 relative z-20 max-w-[1600px] mx-auto"
        aria-label="Quick booking"
      >
        <div className="card p-4 md:p-5 grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_1fr_auto] items-end">
          <Select
            label="Select movie"
            value={quick.movie}
            onChange={(e) =>
              setQuick({ ...quick, movie: e.target.value })
            }
          >
            {showing.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.title} ({m.badge})
              </option>
            ))}
          </Select>

          <Select
            label="Cinema location"
            value={quick.cinema}
            onChange={(e) =>
              setQuick({ ...quick, cinema: e.target.value })
            }
          >
            {CINEMAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.short}
              </option>
            ))}
          </Select>

          <Select
            label="Showtime date"
            value={quick.date}
            onChange={(e) =>
              setQuick({ ...quick, date: e.target.value })
            }
          >
            {dates.map((d, i) => (
              <option key={d} value={d}>
                {i === 0
                  ? 'Today'
                  : i === 1
                    ? 'Tomorrow'
                    : dayShort(d)}
                , {formatDate(d)}
              </option>
            ))}
          </Select>

          <Button
            className="!py-3"
            onClick={findShowtimes}
            icon={Ticket}
          >
            Find Showtimes
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          <span className="label-caps text-on-surface-variant shrink-0">
            Quick jump:
          </span>

          {dates.map((d, i) => (
            <button
              key={d}
              onClick={() => {
                setQuick({ ...quick, date: d });
                toast.info(
                  `Date set to ${formatDate(d, { weekday: true })}.`
                );
              }}
              aria-pressed={quick.date === d}
              className={`shrink-0 w-14 rounded-lg py-1.5 text-center transition-colors ${
                quick.date === d
                  ? 'bg-primary-container text-white shadow-glow'
                  : 'bg-surface-container-low border border-white/5 hover:bg-surface-container-high'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold tracking-wider">
                {dayShort(d)}
              </span>

              <span className="block font-headline text-title-md font-bold leading-none">
                {dayNum(d)}
              </span>

              <span className="block text-[9px] opacity-70">
                {QUICK_LABEL[i]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Now showing */}
      <section
        className="px-margin-mobile md:px-margin py-space-xl max-w-[1600px] mx-auto"
        aria-labelledby="now-showing"
      >
        <p className="flex items-center gap-2 label-caps text-primary-container">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
          In auditoriums now
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="now-showing"
            className="font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white"
          >
            Now Showing in Theaters
          </h2>

          <div className="flex items-center gap-4">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by genre"
            >
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  aria-pressed={chip === c}
                  className={`rounded-full px-4 py-1.5 text-label-sm font-semibold transition-colors ${
                    chip === c
                      ? 'bg-white/15 text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Link
              to="/movies"
              className="hidden sm:flex items-center gap-1.5 text-label-md text-primary-container font-semibold hover:underline"
            >
              View All Films
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {movies.loading ? (
            <MovieGridSkeleton n={4} />
          ) : grid.length === 0 ? (
            <p className="text-on-surface-variant py-10 text-center">
              No {chip} films showing right now.{' '}
              <button
                className="text-primary underline"
                onClick={() => setChip('All Formats')}
              >
                Show all
              </button>
            </p>
          ) : (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-gutter-mobile md:gap-gutter overflow-x-auto md:overflow-visible snap-x no-scrollbar -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
              {grid.map((m) => (
                <div
                  key={m.id}
                  className="snap-start shrink-0 w-[62vw] sm:w-[44vw] md:w-auto"
                >
                  <MovieCard
                    movie={m}
                    next={next.data?.[m.id]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Heatmap */}
      <section
        className="px-margin-mobile md:px-margin pb-space-xl max-w-[1600px] mx-auto"
        aria-labelledby="heatmap"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 label-caps text-secondary">
              <TrendingUp className="w-4 h-4" aria-hidden />
              Box office heatmap
            </p>

            <h2
              id="heatmap"
              className="mt-2 font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white"
            >
              Top 5 Trending Movies
            </h2>
          </div>

          <p className="text-label-sm text-on-surface-variant">
            Updated just now • demo ticket sales
          </p>
        </div>

        <ol className="mt-6 grid gap-gutter-mobile md:gap-gutter sm:grid-cols-2 lg:grid-cols-5">
          {trending.map((m, i) => {
            const pct = [94, 88, 72, 65, 54][i];
            const tag = [
              '#1 BOX OFFICE',
              '#2 TRENDING',
              '#3 POPULAR',
              '#4 CRITIC CHOICE',
              '#5 RISING',
            ][i];

            return (
              <li key={m.id}>
                <Link
                  to={`/movies/${m.slug}`}
                  className="card block p-4 h-full hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`chip ${
                        i === 0
                          ? 'bg-primary-container text-white'
                          : 'bg-white/10 text-on-surface-variant'
                      }`}
                    >
                      {tag}
                    </span>

                    <span className="flex items-center gap-1 text-label-sm text-secondary">
                      <Star
                        className="w-3 h-3 fill-secondary"
                        aria-hidden
                      />
                      {m.score}
                    </span>
                  </div>

                  <h3 className="mt-3 font-headline text-title-md text-white">
                    {m.title}
                  </h3>

                  <p className="mt-1 text-body-sm text-on-surface-variant line-clamp-2">
                    {m.synopsis.split('.')[0]}.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <span>{pct}% capacity today</span>
                  </div>

                  <div className="mt-1.5 h-1 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        pct > 85
                          ? 'bg-primary-container'
                          : pct > 60
                            ? 'bg-secondary-container'
                            : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Anticipated */}
      <section
        className="px-margin-mobile md:px-margin pb-space-xl max-w-[1600px] mx-auto"
        aria-labelledby="soon"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-2 label-caps text-primary-container">
              <Calendar className="w-4 h-4" aria-hidden />
              Countdown to release
            </p>

            <h2
              id="soon"
              className="mt-2 font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white"
            >
              Anticipated Releases
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Previous releases"
              onClick={() => setCarousel((c) => Math.max(0, c - 1))}
              disabled={carousel === 0}
              className="w-10 h-10 rounded-full bg-surface-container-high grid place-items-center disabled:opacity-40 hover:bg-surface-container-highest"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              aria-label="Next releases"
              onClick={() =>
                setCarousel((c) =>
                  Math.min(Math.max(0, soon.length - 1), c + 1)
                )
              }
              disabled={carousel >= soon.length - 1}
              className="w-10 h-10 rounded-full bg-surface-container-high grid place-items-center disabled:opacity-40 hover:bg-surface-container-highest"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-gutter md:grid-cols-3">
          {soon.slice(carousel, carousel + 3).map((m) => {
            const days = Math.max(
              0,
              Math.ceil(
                (new Date(`${m.releaseDate}T00:00`) - new Date()) /
                  86400000
              )
            );

            return (
              <article key={m.id} className="card overflow-hidden">
                <Link
                  to={`/movies/${m.slug}`}
                  className="block relative h-44"
                >
                  <Poster
                    src={m.backdrop || m.poster}
                    title={m.title}
                    ratio="h-full w-full"
                    rounded=""
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />

                  <span className="absolute left-3 top-3 chip bg-primary-container text-white">
                    {formatDate(m.releaseDate)} • In {days} Days
                  </span>
                </Link>

                <div className="p-4">
                  <div className="flex justify-between text-label-sm text-on-surface-variant">
                    <span>
                      {m.genres.slice(0, 2).join(' • ')} • {m.badge}
                    </span>

                    <span className="text-secondary font-bold">
                      {m.anticipation || 90}% Anticipation
                    </span>
                  </div>

                  <h3 className="mt-1 font-headline text-title-md text-white">
                    {m.title}
                  </h3>

                  <p className="mt-1 text-body-sm text-on-surface-variant line-clamp-2">
                    {m.synopsis}
                  </p>

                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Bell}
                      onClick={() =>
                        toast.success(`Reminder set for ${m.title}.`)
                      }
                    >
                      Set Reminder
                    </Button>

                    <Link
                      to={`/movies/${m.slug}`}
                      className="btn-primary btn-sm"
                    >
                      Pre-Book
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <TrailerModal
        movie={hero}
        open={trailer}
        onClose={() => setTrailer(false)}
      />
    </div>
  );
}