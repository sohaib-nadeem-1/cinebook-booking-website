import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Cpu, Gavel, KeyRound, Lock, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Button from '../../components/common/Button.jsx';
import { Field, PasswordField, Checkbox } from '../../components/common/Field.jsx';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { IMAGES } from '../../data/images.js';
import { DEMO_ACCOUNTS } from '../../data/users.js';
import { isEmail } from '../../utils/validators.js';

export default function AdminLoginPage() {
  useDocTitle('Admin sign in');
  const { adminLogin, isAdmin } = useAuth(); const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const from = loc.state?.from || '/admin/dashboard';
  const [f, setF] = useState({ email: '', password: '', remember: false }); const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(''); const [status, setStatus] = useState('idle'); const [forgot, setForgot] = useState(false);
  if (isAdmin && status !== 'success') return <Navigate to={from} replace />;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault(); const er = {};
    if (!f.email.trim()) er.email = 'Admin email is required'; else if (!isEmail(f.email)) er.email = 'Enter a valid email address';
    if (!f.password) er.password = 'Password is required';
    setErrors(er); if (Object.keys(er).length) return;
    setStatus('loading');
    try { const u = await adminLogin(f); setStatus('success'); toast.success(`Signed in as ${u.name}.`); setTimeout(() => nav(from, { replace: true }), 450); }
    catch (err) { setStatus('idle'); setFormError(err.message); }
  };

  const Stat = ({ label, value, sub, pct, tone }) => (<div><p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</p><p className="font-headline text-headline-md font-bold text-white mt-1">{value}{sub && <span className="text-body-md text-on-surface-variant"> {sub}</span>}</p><div className="h-1 rounded-full bg-white/10 mt-2"><div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} /></div></div>);
  return (
    <AuthShell image={IMAGES.adminLoginBg} backLabel="Back to browse" art={{
      top: (<div className="flex justify-between"><span className="chip bg-surface-container-high/80 text-white backdrop-blur"><span className="w-2 h-2 rounded-full bg-primary-container" />OPERATIONS SUITE V2.4</span><span className="chip bg-surface-container-high/80 text-secondary backdrop-blur"><ShieldCheck className="w-4 h-4" aria-hidden />SYSTEM_STATUS: SECURE</span></div>),
      bottom: (<div className="max-w-xl"><p className="label-caps text-secondary flex items-center gap-2 mb-3"><Cpu className="w-4 h-4" aria-hidden />Mission critical systems</p>
        <h1 className="font-headline text-display-hero font-extrabold text-white">Manage your cinema experience.</h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">Centralized administration for box office schedules, theater auditoriums, ticket ticketing, and financial reporting.</p>
        <div className="mt-6 grid grid-cols-3 gap-5 rounded-2xl bg-surface-container-low/80 border border-white/5 p-5">
          <Stat label="Active screens" value="48" sub="/ 48" pct={100} tone="bg-primary-container" /><Stat label="Seat capacity" value="92.4%" pct={92} tone="bg-secondary-container" /><Stat label="Projection rig" value="LASER 4K" pct={82} tone="bg-tertiary" /></div>
        <p className="mt-3 text-label-sm text-on-surface-variant">Illustrative demo telemetry — not connected to real hardware.</p></div>) }}>
      <div className="card border-t-2 !border-t-primary-container p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4"><span className="chip bg-surface-container-high text-white"><ShieldAlert className="w-4 h-4 text-primary-container" aria-hidden />ADMIN PORTAL</span><span className="text-label-sm text-on-surface-variant tracking-wider">NODE_SEC_01</span></div>
        <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-white">Welcome, Administrator</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">Enter your authorized CineBook operations credentials.</p>
        {formError && <div role="alert" className="mt-4 rounded-xl border border-error/40 bg-error-container/30 px-4 py-3 text-body-sm text-on-error-container">{formError}</div>}
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Field label="Admin email" type="email" icon={Mail} value={f.email} onChange={set('email')} error={errors.email} placeholder="admin@cinebook.com" autoComplete="username" />
          <PasswordField label="Security key / password" icon={Lock} value={f.password} onChange={set('password')} error={errors.password} placeholder="••••••••••••" autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3"><Checkbox label="Remember me on this workstation" checked={f.remember} onChange={set('remember')} />
            <button type="button" onClick={() => setForgot(true)} className="text-label-md text-primary hover:underline shrink-0">Forgot password?</button></div>
          <Button type="submit" className="w-full !py-3.5 !text-body-md" icon={status === 'success' ? Check : KeyRound} loading={status === 'loading'} loadingText="Verifying…" disabled={status === 'success'}>{status === 'success' ? 'Access granted' : 'Sign In to Dashboard'}</Button>
        </form>
        <div className="mt-3 grid grid-cols-2 gap-2 text-label-sm">
          <button type="button" onClick={() => { setF((x) => ({ ...x, ...DEMO_ACCOUNTS.admin })); setErrors({}); setFormError(''); }} className="rounded-lg bg-surface-container-high/60 py-2 text-on-surface-variant hover:text-white">Fill demo System Admin</button>
          <button type="button" onClick={() => { setF((x) => ({ ...x, ...DEMO_ACCOUNTS.box })); setErrors({}); setFormError(''); }} className="rounded-lg bg-surface-container-high/60 py-2 text-on-surface-variant hover:text-white">Fill demo Box Office</button></div>
        <div className="mt-5 flex gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4 text-body-sm text-on-surface-variant"><Gavel className="w-5 h-5 shrink-0 text-on-surface-variant" aria-hidden /><p><b className="text-white">Authorized personnel only.</b> All access attempts are logged and monitored with IP verification. Unauthorized ingress triggers administrative lock. <span className="text-on-surface-variant/70">(Frontend demo — no real monitoring.)</span></p></div>
      </div>
      <Link to="/" className="mt-5 flex items-center justify-center gap-2 text-label-md text-secondary hover:text-white"><ArrowLeft className="w-4 h-4" aria-hidden />Back to CineBook customer site</Link>
      <ForgotPasswordModal open={forgot} onClose={() => setForgot(false)} initialEmail={f.email} />
    </AuthShell>
  );
}
