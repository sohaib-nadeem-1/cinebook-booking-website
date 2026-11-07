import { useState } from 'react';
import { initials, hash } from '../../utils/format.js';

const TINTS = ['bg-primary-container/25 text-[#ff8a80]', 'bg-secondary-container/25 text-secondary', 'bg-sky-400/20 text-sky-300', 'bg-emerald-400/20 text-emerald-300', 'bg-white/10 text-on-surface-variant'];
export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const s = { sm: 'w-8 h-8 text-label-sm', md: 'w-10 h-10 text-label-md', lg: 'w-16 h-16 text-headline-sm', xl: 'w-24 h-24 text-headline-md' }[size];
  if (src && !failed) return <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`${s} rounded-full object-cover shrink-0 ${className}`} />;
  return <span aria-label={name} className={`${s} rounded-full grid place-items-center font-bold shrink-0 ${TINTS[Math.floor(hash(name) * TINTS.length)]} ${className}`}>{initials(name) || '?'}</span>;
}
