
import { Link } from 'react-router-dom';
import { Clock, Star, Ticket } from 'lucide-react';
import Poster from '../common/Poster.jsx';
import { duration, time12, relativeDay } from '../../utils/format.js';

/** Movie poster card with next-show information and booking actions. */
export default function MovieCard({ movie, next, compact = false }) {
  const soon = movie.status === 'coming_soon';

  const auditoriumName =
    next?.auditorium?.name ||
    (next?.auditorium?.hall_no
      ? `Hall ${next.auditorium.hall_no}`
      : null) ||
    (next?.auditoriumId
      ? `Hall ${next.auditoriumId}`
      : null) ||
    (next?.auditorium_id
      ? `Hall ${next.auditorium_id}`
      : null);

  return (
    <article className="group card overflow-hidden flex flex-col transition-all duration-300 md:hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,.75),0_8px_24px_-6px_rgba(229,9,20,.25)]">
      <Link
        to={`/movies/${movie.slug}`}
        className="relative block p-3 pb-0"
        aria-label={`${movie.title} details`}
      >
        <div className="flex items-center justify-between pb-2 text-label-sm">
          <span className="font-bold tracking-wider text-secondary uppercase truncate">
            {movie.badge}
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-on-surface">
            {movie.rating}
          </span>
        </div>

        <div className="relative">
          <Poster src={movie.poster} title={movie.title} />

          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80" />

          {!soon && movie.score > 0 && (
            <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur px-2 py-1 text-label-sm text-white">
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" aria-hidden />
              <b>{movie.score}</b>
              <span className="text-on-surface-variant">/10</span>
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2 text-label-sm text-on-surface-variant">
          <span className="truncate">
            {movie.genres.slice(0, 3).join(' • ')}
          </span>
          <span className="shrink-0 tabular-nums">
            {duration(movie.runtime)}
          </span>
        </div>

        <h3 className="font-headline text-title-md text-white leading-snug line-clamp-2 min-h-[3rem]">
          <Link to={`/movies/${movie.slug}`} className="hover:text-primary">
            {movie.title}
          </Link>
        </h3>

        {!compact &&
          (soon ? (
            <p className="flex items-center gap-1.5 text-label-sm text-secondary">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              Releases{' '}
              {new Date(movie.releaseDate + 'T00:00').toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
              )}
            </p>
          ) : next ? (
            <p className="flex items-center gap-1.5 text-label-sm text-secondary">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              Next: {relativeDay(next.date) === 'Today' ? '' : `${relativeDay(next.date)} `}
              {time12(next.start)}
              {auditoriumName && ` (${auditoriumName})`}
            </p>
          ) : (
            <p className="text-label-sm text-on-surface-variant">
              No upcoming shows
            </p>
          ))}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            to={`/movies/${movie.slug}`}
            className="btn-secondary btn-sm !rounded-lg"
          >
            Details
          </Link>

          <Link
            to={`/movies/${movie.slug}${soon ? '' : '#showtimes'}`}
            className="btn-primary btn-sm !rounded-lg"
          >
            <Ticket className="w-3.5 h-3.5" aria-hidden />
            {soon ? 'Remind me' : 'Book'}
          </Link>
        </div>
      </div>
    </article>
  );
}
