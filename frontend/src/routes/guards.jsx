import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useEffect } from 'react';

/** Frontend-only guards (UX, not security). The Express API must enforce all of this again. */
export function RequireCustomer({ allowGuest = false }) {
  const { user } = useAuth(); const loc = useLocation(); const toast = useToast();
  const ok = user && (allowGuest || !user.guest);
  useEffect(() => { if (!ok) toast.info(user?.guest ? 'Create an account or sign in to view this page.' : 'Please sign in to continue.'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ok) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { admin } = useAuth(); const loc = useLocation();
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
  return <Outlet />;
}

/** Permission gate for a single admin page (box-office staff can't open Users/Settings). */
export function RequirePermission({ perm, children }) {
  const { can } = useAuth(); const toast = useToast();
  const allowed = can(perm);
  useEffect(() => { if (!allowed) toast.warning('Your role does not have access to that area.'); }, [allowed]); // eslint-disable-line react-hooks/exhaustive-deps
  return allowed ? children : <Navigate to="/admin/dashboard" replace />;
}
