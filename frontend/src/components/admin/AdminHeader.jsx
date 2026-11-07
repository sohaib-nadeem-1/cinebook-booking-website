import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronRight, Film, LogOut, Menu as MenuIcon, PanelLeft, Search, Settings, Store, Ticket, Clock, X } from 'lucide-react';
import Menu, { MenuItem } from '../common/Menu.jsx';
import Avatar from '../common/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { adminService } from '../../services/adminService.js';
import { movieService } from '../../services/movieService.js';
import { bookingService } from '../../services/bookingService.js';
import { showtimeService } from '../../services/showtimeService.js';

const TITLES = { dashboard: 'Overview', movies: 'Movies', showtimes: 'Showtimes', bookings: 'Bookings', users: 'Users', settings: 'Settings' };

function GlobalSearch() {
  const nav = useNavigate(); const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const dq = useDebounce(q, 250);
  const { data } = useAsync(async () => {
    if (dq.trim().length < 2) return null;
    const [m, b, s] = await Promise.all([movieService.list({ search: dq, scope: 'admin' }), bookingService.list({ search: dq }), showtimeService.list({ search: dq })]);
    return { movies: m.slice(0, 3), bookings: b.slice(0, 3), showtimes: s.slice(0, 3) };
  }, [dq]);
  const go = (to) => { setOpen(false); setQ(''); nav(to); };
  const none = data && !data.movies.length && !data.bookings.length && !data.showtimes.length;
  const Group = ({ title, icon: Icon, items, to, label }) => items.length > 0 && (
    <div className="py-1"><p className="px-3 py-1 label-caps text-on-surface-variant">{title}</p>{items.map((it) => <button key={it.id} onClick={() => go(`${to}?q=${encodeURIComponent(label(it).key)}`)} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5"><Icon className="w-4 h-4 text-on-surface-variant" aria-hidden /><span className="text-label-md text-white truncate">{label(it).text}</span></button>)}</div>);
  return (
    <div className="relative flex-1 max-w-xl hidden sm:block" role="search">
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && q.trim()) go(/^#?cb-/i.test(q.trim()) ? `/admin/bookings?q=${encodeURIComponent(q.trim().replace('#', ''))}` : `/admin/movies?q=${encodeURIComponent(q.trim())}`); }}
        aria-label="Search movies, showtimes, customer bookings" placeholder="Search movies, showtimes, customer bookings…" className="field rounded-xl pl-10 pr-9 py-2 text-body-sm" />
      {q && <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-on-surface-variant hover:text-white"><X className="w-4 h-4" /></button>}
      {open && dq.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full glass rounded-xl p-2 shadow-modal" style={{ background: 'rgba(24,26,34,.97)' }}>
          {!data ? <p className="px-3 py-3 text-body-sm text-on-surface-variant">Searching…</p> : none ? <p className="px-3 py-3 text-body-sm text-on-surface-variant">No matches for “{dq}”.</p> : <>
            <Group title="Movies" icon={Film} items={data.movies} to="/admin/movies" label={(m) => ({ key: m.title, text: m.title })} />
            <Group title="Bookings" icon={Ticket} items={data.bookings} to="/admin/bookings" label={(b) => ({ key: b.id, text: `${b.id} • ${b.customer.name}` })} />
            <Group title="Showtimes" icon={Clock} items={data.showtimes} to="/admin/showtimes" label={(s) => ({ key: s.movie.title, text: `${s.movie.title} • ${s.date} ${s.start}` })} /></>}
        </div>)}
    </div>
  );
}

function AdminNotifications() {
  const { data, reload } = useAsync(() => adminService.notifications('admin'), []); const unread = (data || []).filter((n) => !n.read).length;
  return (
    <Menu label="Notifications" width="w-80" trigger={({ toggle, props }) => (<button onClick={toggle} {...props} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative p-2.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10"><Bell className="w-5 h-5" />{unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container ring-2 ring-background" />}</button>)}>
      {() => (<div><div className="flex items-center justify-between px-3 py-2"><span className="font-headline font-semibold text-white">Alerts</span><button className="text-label-sm text-secondary hover:underline disabled:opacity-40" disabled={!unread} onClick={() => { adminService.markNotificationsRead('admin'); reload(true); }}>Mark all read</button></div>
        {(data || []).map((n) => <div key={n.id} className="px-3 py-2.5 rounded-lg hover:bg-white/5 flex gap-3"><span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-white/15' : 'bg-primary-container'}`} /><div><p className="text-label-md text-white">{n.title}</p><p className="text-body-sm text-on-surface-variant">{n.body}</p><p className="text-label-sm text-on-surface-variant/60">{n.time}</p></div></div>)}</div>)}
    </Menu>
  );
}

export default function AdminHeader({ onMenu, onToggleRail }) {
  const { admin, adminLogout } = useAuth(); const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const seg = loc.pathname.split('/')[2] || 'dashboard';
  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 bg-background/85 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex items-center gap-3">
      <button onClick={onMenu} aria-label="Open navigation menu" className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10"><MenuIcon className="w-5 h-5" /></button>
      <button onClick={onToggleRail} aria-label="Toggle sidebar labels" className="hidden md:block lg:hidden p-2 rounded-lg hover:bg-white/10"><PanelLeft className="w-5 h-5" /></button>
      <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-label-md text-on-surface-variant"><Link to="/admin/dashboard" className="hover:text-white">Admin</Link><ChevronRight className="w-4 h-4" aria-hidden /><span className="text-white font-semibold">{TITLES[seg] || 'Overview'}</span></nav>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1">
        <AdminNotifications />
        <Menu label="Admin account" width="w-64" trigger={({ toggle, props }) => (<button onClick={toggle} {...props} className="flex items-center gap-2 rounded-full bg-surface-container-low border border-white/5 pl-1 pr-3 py-1 hover:bg-surface-container-high"><Avatar name={admin.name} src={admin.avatar} size="sm" /><span className="hidden sm:block text-label-md text-white">{admin.name.split(' ')[0]} {admin.name.split(' ')[1]?.[0]}.</span><ChevronDown className="w-4 h-4 text-on-surface-variant" /></button>)}>
          {(close) => (<><div className="px-3 py-2 border-b border-white/5 mb-1"><p className="text-label-md text-white">{admin.name}</p><p className="text-body-sm text-on-surface-variant truncate">{admin.email}</p><p className="mt-1 text-label-sm text-secondary">{admin.role === 'system_admin' ? 'System Admin' : 'Box Office Staff'}</p></div>
            {admin.role === 'system_admin' && <MenuItem icon={Settings} onClick={() => { close(); nav('/admin/settings'); }}>Account settings</MenuItem>}
            <MenuItem icon={Store} onClick={() => { close(); nav('/'); }}>Back to CineBook</MenuItem>
            <MenuItem icon={LogOut} danger onClick={() => { close(); adminLogout(); toast.info('You’ve been signed out of the admin console.'); nav('/admin/login'); }}>Sign out</MenuItem></>)}
        </Menu>
      </div>
    </header>
  );
}
