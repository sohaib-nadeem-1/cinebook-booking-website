import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, MapPin, Search, Ticket, User, LogIn, Film, Home, Clock3, Check } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import Menu, { MenuItem } from '../common/Menu.jsx';
import Avatar from '../common/Avatar.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePrefs } from '../../context/PrefsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CINEMAS } from '../../data/cinemas.js';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';

const LINKS = [
  { to: '/', label: 'Home', end: true, icon: Home },
  { to: '/movies', label: 'Movies', icon: Film, match: (loc) => loc.pathname.startsWith('/movies') && !loc.search.includes('coming_soon') },
  { to: '/movies?status=coming_soon', label: 'Coming Soon', icon: Clock3, match: (loc) => loc.pathname.startsWith('/movies') && loc.search.includes('coming_soon') },
  { to: '/my-bookings', label: 'My Bookings', icon: Ticket },
];

const pill = (active) => `px-4 py-2 rounded-lg text-label-md transition-all ${active ? 'bg-primary-container text-white font-semibold shadow-[0_2px_12px_rgba(229,9,20,0.35)]' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`;

function NotificationsMenu() {
  const { data, reload } = useAsync(() => adminService.notifications('customer'), []);
  const unread = (data || []).filter((n) => !n.read).length;
  return (
    <Menu label="Notifications" width="w-80" trigger={({ toggle, props }) => (
      <button onClick={toggle} {...props} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative p-2.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10">
        <Bell className="w-5 h-5" />{unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface" />}
      </button>)}>
      {() => (
        <div>
          <div className="flex items-center justify-between px-3 py-2"><span className="font-headline font-semibold text-white">Notifications</span>
            <button className="text-label-sm text-secondary hover:underline disabled:opacity-40" disabled={!unread} onClick={() => { adminService.markNotificationsRead('customer'); reload(true); }}>Mark all read</button></div>
          <ul>{(data || []).map((n) => (
            <li key={n.id} className="px-3 py-2.5 rounded-lg hover:bg-white/5 flex gap-3">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-white/15' : 'bg-primary-container'}`} />
              <div><p className="text-label-md text-white">{n.title}</p><p className="text-body-sm text-on-surface-variant">{n.body}</p><p className="text-label-sm text-on-surface-variant/60 mt-0.5">{n.time}</p></div>
            </li>))}</ul>
        </div>)}
    </Menu>
  );
}

export default function Navbar() {
  const { user, isCustomer, logout } = useAuth();
  const { cinema, cinemaId, setCinema } = usePrefs();
  const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="h-16 md:h-20 px-margin-mobile md:px-margin flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-lg min-w-0">
            <Logo />
            <div className="h-6 w-px bg-surface-container-highest hidden lg:block" />
            <Menu align="left" width="w-80" label="Choose cinema" trigger={({ toggle, props }) => (
              <button onClick={toggle} {...props} className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-left transition-colors">
                <MapPin className="w-4 h-4 text-secondary" aria-hidden /><span className="text-label-md text-on-surface">{cinema.city}</span>
                <span className="text-label-sm text-on-surface-variant">• {cinema.short}</span><ChevronDown className="w-4 h-4 text-on-surface-variant" aria-hidden />
              </button>)}>
              {(close) => (<div role="group" aria-label="Cinemas"><p className="px-3 py-2 label-caps text-on-surface-variant">Your cinema</p>
                {CINEMAS.map((c) => (
                  <button key={c.id} role="menuitemradio" aria-checked={c.id === cinemaId} onClick={() => { setCinema(c.id); close(); toast.info(`Now showing times for ${c.short}.`); }}
                    className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5">
                    <span><span className="block text-label-md text-white">{c.name}</span><span className="block text-body-sm text-on-surface-variant">{c.area}</span></span>
                    {c.id === cinemaId && <Check className="w-4 h-4 text-secondary shrink-0" />}
                  </button>))}</div>)}
            </Menu>
          </div>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => <NavLink key={l.label} to={l.to} end={l.end} className={({ isActive }) => pill(l.match ? l.match(loc) : isActive)}>{l.label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="p-2.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10"><Search className="w-5 h-5" /></button>
            {isCustomer && <NotificationsMenu />}
            {user ? (
              <Menu label="Account" width="w-60" trigger={({ toggle, props }) => (
                <button onClick={toggle} {...props} aria-label="Account menu" className="flex items-center gap-1 rounded-full p-0.5 pr-2 hover:bg-white/10"><Avatar name={user.name} src={user.avatar} size="sm" /><ChevronDown className="w-4 h-4 text-on-surface-variant hidden sm:block" /></button>)}>
                {(close) => (<>
                  <div className="px-3 py-2 border-b border-white/5 mb-1"><p className="text-label-md text-white truncate">{user.name}</p><p className="text-body-sm text-on-surface-variant truncate">{user.guest ? 'Browsing as guest' : user.email}</p></div>
                  {isCustomer ? (<>
                    <MenuItem icon={Ticket} onClick={() => { close(); nav('/my-bookings'); }}>My bookings</MenuItem>
                    <MenuItem icon={User} onClick={() => { close(); nav('/profile'); }}>Profile</MenuItem>
                    <MenuItem icon={LogOut} danger onClick={() => { close(); logout(); toast.info('You’ve been signed out.'); nav('/'); }}>Sign out</MenuItem></>) : (
                    <MenuItem icon={LogIn} onClick={() => { close(); logout(); nav('/login'); }}>Sign in to your account</MenuItem>)}
                </>)}
              </Menu>) : (
              <Link to="/login" state={{ from: loc.pathname + loc.search }} className="btn-primary btn-sm !px-4 !py-2"><LogIn className="w-4 h-4" aria-hidden />Sign in</Link>)}
          </div>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Mobile tab bar — hidden during booking/checkout where a sticky summary owns the bottom edge */}
      {!/^\/(booking|checkout|login|register)/.test(loc.pathname) && (
        <nav aria-label="Mobile" className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/10 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {LINKS.map((l) => { const active = l.match ? l.match(loc) : l.end ? loc.pathname === l.to : loc.pathname.startsWith(l.to);
            return (<Link key={l.label} to={l.to} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-primary-container' : 'text-on-surface-variant'}`}>
              <l.icon className="w-5 h-5" aria-hidden />{l.label}</Link>); })}
        </nav>)}
    </>
  );
}
