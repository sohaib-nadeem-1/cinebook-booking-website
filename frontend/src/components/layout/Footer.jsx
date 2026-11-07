import { Link } from 'react-router-dom';
import { Award, Lock, ShieldCheck, Smartphone, Play, Disc3 } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const GENRES = [['Action & Sci-Fi', '/movies?genre=Sci-Fi'], ['IMAX 70mm Special', '/movies?format=IMAX 70MM'], ['Psychological Thriller', '/movies?genre=Psychological'], ['Award Contenders', '/movies?sort=rating'], ['Animation & Family', '/movies?genre=Animation']];
const QUICK = [['Today’s Showtimes', '/movies?status=now_showing'], ['Dolby Cinema Seats', '/movies?format=DOLBY CINEMA'], ['Private Screening Lounges', '/movies?format=VIP LOUNGE']];

export default function Footer() {
  const toast = useToast();
  const soon = (what) => () => toast.info(`${what} is coming in a later release.`);
  const linkCls = 'text-body-sm text-on-surface-variant hover:text-white transition-colors text-left';
  return (
    <footer className="border-t border-white/5 bg-surface-container-lowest mt-space-xl">
      <div className="px-margin-mobile md:px-margin py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] max-w-[1600px] mx-auto">
        <div className="space-y-4 max-w-sm">
          <Logo />
          <p className="text-body-sm text-on-surface-variant">Immerse yourself in cinematic brilliance with premium format screening, VIP acoustics, reserved luxury recliners, and frictionless ticketing.</p>
          <div className="rounded-xl bg-surface-container-low border border-white/5 p-4">
            <p className="flex items-center gap-2 text-label-md font-semibold text-secondary"><Award className="w-4 h-4" aria-hidden />CineClub VIP Tier</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">Earn 2x credits on Dolby Cinema, zero online booking fees, and complimentary premiere invitations.</p>
          </div>
        </div>
        <div><h2 className="font-headline text-title-md text-white mb-3">Curated Genres</h2><ul className="space-y-2">{GENRES.map(([l, to]) => <li key={l}><Link className={linkCls} to={to}>{l}</Link></li>)}</ul></div>
        <div><h2 className="font-headline text-title-md text-white mb-3">Quick Booking</h2><ul className="space-y-2">
          {QUICK.map(([l, to]) => <li key={l}><Link className={linkCls} to={to}>{l}</Link></li>)}
          <li><button className={linkCls} onClick={soon('Gift cards & vouchers')}>Gift Cards &amp; Vouchers</button></li>
          <li><Link className={linkCls} to="/movies?status=now_showing">Concessions Pre-order</Link></li></ul></div>
        <div><h2 className="font-headline text-title-md text-white mb-3">Experience On Mobile</h2>
          <p className="text-body-sm text-on-surface-variant mb-3">Instant digital ticket wallet entry and real-time seat alerts.</p>
          <div className="space-y-2">
            <button onClick={soon('The iOS app')} className="w-full flex items-center gap-3 rounded-lg bg-surface-container-high px-4 py-2.5 text-left hover:bg-surface-container-highest"><Smartphone className="w-5 h-5" aria-hidden /><span><span className="block text-[10px] text-on-surface-variant leading-none">Download on</span><span className="text-label-md font-semibold text-white">Apple App Store</span></span></button>
            <button onClick={soon('The Android app')} className="w-full flex items-center gap-3 rounded-lg bg-surface-container-high px-4 py-2.5 text-left hover:bg-surface-container-highest"><Play className="w-5 h-5" aria-hidden /><span><span className="block text-[10px] text-on-surface-variant leading-none">Get it on</span><span className="text-label-md font-semibold text-white">Google Play</span></span></button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-margin-mobile md:px-margin py-5 flex flex-col md:flex-row gap-3 md:items-center justify-between text-label-sm text-on-surface-variant">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-secondary" aria-hidden />PCI-DSS Level 1 Encrypted</span>
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-secondary" aria-hidden />256-Bit SSL Ticket Encryption</span>
          <span className="flex items-center gap-1.5"><Disc3 className="w-4 h-4 text-secondary" aria-hidden />Dolby Atmos &amp; IMAX Certified</span>
        </div>
        <span>© {new Date().getFullYear()} CineBook Theatres Corporation. All rights reserved.</span>
      </div>
    </footer>
  );
}
