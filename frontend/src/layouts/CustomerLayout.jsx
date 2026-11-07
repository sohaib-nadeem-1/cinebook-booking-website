import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function CustomerLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const bare = /^\/(booking|checkout)/.test(pathname);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to content</a>
      <Navbar />
      <main id="main" className={`flex-1 pt-16 md:pt-20 ${bare ? '' : 'pb-16 md:pb-0'}`}><Outlet /></main>
      <Footer />
    </div>
  );
}
