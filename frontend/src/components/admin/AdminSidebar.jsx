import { NavLink, useNavigate } from 'react-router-dom';
import { Clock, Film, LayoutDashboard, LogOut, Settings, Ticket, Users, Store } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import Avatar from '../common/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard' },
  { to: '/admin/movies', label: 'Movies', icon: Film, perm: 'movies' },
  { to: '/admin/showtimes', label: 'Showtimes', icon: Clock, perm: 'showtimes' },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket, perm: 'bookings' },
  { to: '/admin/users', label: 'Users', icon: Users, perm: 'users' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, perm: 'settings' },
];

/** `expanded` = labels visible at tablet widths; on lg+ the sidebar is always full; in the mobile drawer it is always full. */
export default function AdminSidebar({ expanded = false, forceFull = false, onNavigate }) {
  const { admin, adminLogout, can } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const hideLabel = forceFull ? '' : expanded ? '' : 'md:hidden lg:inline';
  const logout = () => { adminLogout(); toast.info('You’ve been signed out of the admin console.'); nav('/admin/login'); };
  return (
    <div className="h-full flex flex-col bg-surface-container-lowest border-r border-white/5">
      <div className={`h-16 md:h-20 flex items-center px-4 ${forceFull || expanded ? '' : 'md:justify-center lg:justify-start'}`}>
        {forceFull || expanded ? <Logo to="/admin/dashboard" admin /> : <><span className="hidden lg:block"><Logo to="/admin/dashboard" admin /></span><span className="hidden md:block lg:hidden"><Logo to="/admin/dashboard" size="sm" className="[&>span:last-child]:hidden [&>span:nth-child(2)]:hidden" /></span></>}
      </div>
      <p className={`px-6 pb-2 pt-2 label-caps text-on-surface-variant ${hideLabel}`}>Menu</p>
      <nav aria-label="Admin" className="flex-1 px-3 space-y-1">
        {ITEMS.filter((i) => can(i.perm)).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} title={label} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-label-md transition-all ${forceFull || expanded ? '' : 'md:justify-center lg:justify-start'} ${isActive ? 'bg-primary-container text-white font-semibold shadow-glow' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}>
            <Icon className="w-5 h-5 shrink-0" aria-hidden /><span className={hideLabel}>{label}</span></NavLink>))}
      </nav>
      <div className="p-3 space-y-2">
        <NavLink to="/" onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-label-md text-on-surface-variant hover:text-white hover:bg-white/5 ${forceFull || expanded ? '' : 'md:justify-center lg:justify-start'}`} title="Back to CineBook"><Store className="w-5 h-5 shrink-0" aria-hidden /><span className={hideLabel}>Back to CineBook</span></NavLink>
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-white/5 p-2.5">
          <Avatar name={admin.name} src={admin.avatar} size="sm" className="!bg-primary-container !text-white" />
          <div className={`min-w-0 flex-1 ${hideLabel}`}><p className="text-label-md text-white truncate">{admin.name}</p><p className="text-label-sm text-on-surface-variant truncate">{admin.role === 'system_admin' ? 'Lead Supervisor' : 'Box Office Staff'}</p></div>
          <button onClick={logout} aria-label="Sign out" title="Sign out" className={`p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 ${forceFull || expanded ? '' : 'md:hidden lg:block'}`}><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
