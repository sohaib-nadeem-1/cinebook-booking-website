import { Play } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Poster from '../common/Poster.jsx';

/** No real video is embedded (no external video API in this phase) — a poster-stage placeholder is shown. */
export default function TrailerModal({ movie, open, onClose }) {
  if (!movie) return null;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={`${movie.title} — Official Trailer`} description={`Runtime ${movie.trailer || '2m 30s'} • Demo player`}>
      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
        <Poster src={movie.backdrop || movie.poster} title={movie.title} ratio="h-full w-full" rounded="" className="opacity-60" />
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-center px-4"><span className="mx-auto w-16 h-16 rounded-full bg-primary-container grid place-items-center shadow-glow"><Play className="w-7 h-7 text-white fill-white ml-1" aria-hidden /></span>
            <p className="mt-3 text-white font-semibold">Trailer preview</p><p className="text-body-sm text-on-surface-variant">Video streaming connects when the media backend is added.</p></div></div>
      </div>
    </Modal>
  );
}
