import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import Modal from '../components/common/Modal.jsx';
import { store } from '../utils/storage.js';
import { readSettings } from '../services/settingsService.js';

export default function AdminLayout() {
  const [rail, setRail] = useState(false); const [drawer, setDrawer] = useState(false); const loc = useLocation();
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { if (!drawer) return undefined; const k = (e) => e.key === 'Escape' && setDrawer(false); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [drawer]);
  useEffect(() => { document.documentElement.dataset.density = readSettings().system.highDensity ? 'compact' : 'comfortable'; return () => { delete document.documentElement.dataset.density; }; }, []);
  return (
    <div className="min-h-screen bg-background">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to content</a>
      <aside className={`hidden md:block fixed inset-y-0 left-0 z-40 transition-[width] ${rail ? 'md:w-60' : 'md:w-[72px] lg:w-60'}`}><AdminSidebar expanded={rail} /></aside>
      <div className={`${rail ? 'md:pl-60' : 'md:pl-[72px] lg:pl-60'} transition-[padding]`}>
        <AdminHeader onMenu={() => setDrawer(true)} onToggleRail={() => setRail((r) => !r)} />
        <main id="admin-main" className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto"><Outlet /></main>
      </div>
      {drawer && (<div className="md:hidden fixed inset-0 z-[80]"><div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} aria-hidden /><div className="absolute inset-y-0 left-0 w-72 animate-fade-in" role="dialog" aria-modal="true" aria-label="Admin navigation"><AdminSidebar forceFull onNavigate={() => setDrawer(false)} /></div></div>)}
    </div>
  );
}
