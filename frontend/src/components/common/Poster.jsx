import { useState } from 'react';
import { Film } from 'lucide-react';
import { hash } from '../../utils/format.js';

/** Poster with graceful fallback (a branded gradient + title) when the remote image fails or is missing. */
export default function Poster({ src, title = '', className = '', ratio = 'aspect-[2/3]', eager = false, rounded = 'rounded-lg' }) {
  const [failed, setFailed] = useState(false);
  const hue = Math.floor(hash(title) * 360);
  return (
    <div className={`relative overflow-hidden bg-surface-container ${ratio} ${rounded} ${className}`}>
      {src && !failed ? (
        <img src={src} alt={`${title} poster`} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div role="img" aria-label={`${title} poster placeholder`} className="absolute inset-0 grid place-items-center p-3 text-center" style={{ background: `linear-gradient(160deg, hsl(${hue} 45% 22%), #0c0e14 85%)` }}>
          <div><Film className="w-6 h-6 mx-auto text-white/40 mb-2" aria-hidden /><span className="font-headline font-bold text-white/80 text-label-md leading-tight block">{title}</span></div>
        </div>
      )}
    </div>
  );
}
