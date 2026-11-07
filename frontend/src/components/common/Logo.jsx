import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export function LogoMark({ size = 'md' }) {
  const s = size === 'lg' ? 'w-10 h-10 rounded-xl' : size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-lg';
  return <span className={`${s} bg-primary-container grid place-items-center shadow-glow shrink-0`}><Clapperboard className="w-[55%] h-[55%] text-white" aria-hidden /></span>;
}
export default function Logo({ to = '/', admin = false, size = 'md', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 group ${className}`} aria-label="CineBook home">
      <LogoMark size={size} />
      <span className="font-headline font-bold text-headline-sm tracking-tight text-on-surface">Cine<span className="text-primary-container">Book</span></span>
      {admin && <span className="ml-1 rounded-md bg-primary-container px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white">ADMIN</span>}
    </Link>
  );
}
