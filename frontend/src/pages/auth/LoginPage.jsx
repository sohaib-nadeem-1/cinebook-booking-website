import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lock, Mail, QrCode, ScanLine, ShieldCheck, ShieldAlert, Timer, User, Volume2, Film, BadgeCheck } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell.jsx';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal.jsx';
import Button from '../../components/common/Button.jsx';
import { Field, PasswordField, Checkbox } from '../../components/common/Field.jsx';
import { LogoMark } from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { IMAGES } from '../../data/images.js';
import { DEMO_ACCOUNTS } from '../../data/users.js';
import { isEmail } from '../../utils/validators.js';

export default function LoginPage() {
  useDocTitle('Sign in');
  const { login, guest, isCustomer } = useAuth(); const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const from = loc.state?.from || '/';
  const [form, setForm] = useState({ email: loc.state?.email || '', password: '', remember: true });
  const [errors, setErrors] = useState({}); const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [forgot, setForgot] = useState(false);
  if (isCustomer && status !== 'success') return <Navigate to={from} replace />;

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError(''); };
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.email.trim()) er.email = 'Email address is required'; else if (!isEmail(form.email)) er.email = 'Enter a valid email address';
    if (!form.password) er.password = 'Password is required';
    setErrors(er); if (Object.keys(er).length) return;
    setStatus('loading'); setFormError('');
    try {
      const u = await login(form); setStatus('success'); toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      setTimeout(() => nav(from, { replace: true }), 500);
    } catch (err) { setStatus('idle'); setFormError(err.message); }
  };
  const fillDemo = () => { setForm((f) => ({ ...f, ...DEMO_ACCOUNTS.customer })); setErrors({}); setFormError(''); toast.info('Demo customer credentials filled in.'); };
  const continueGuest = () => { guest(); toast.info('Browsing as a guest. You can check out without an account.'); nav(from, { replace: true }); };

  return (
    <AuthShell image={IMAGES.loginBg} art={{
      top: (<div className="flex justify-between"><span className="chip bg-surface-container-high/80 text-white backdrop-blur"><span className="w-2 h-2 rounded-full bg-primary-container" />PREMIUM CINEMATIC EXPERIENCE</span>
        <span className="chip bg-surface-container-high/80 text-secondary backdrop-blur"><BadgeCheck className="w-4 h-4" aria-hidden />IMAX 70MM CERTIFIED</span></div>),
      bottom: (<div className="max-w-xl">
        <span className="chip bg-primary-container/80 text-white mb-4"><Film className="w-4 h-4" aria-hidden />AUDITORIUM PRIME • SCREEN 01</span>
        <h1 className="font-headline text-display-hero font-extrabold text-white">Welcome back to Cine<span className="text-primary-container">Book</span></h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">Book your next movie experience in just a few clicks with reserved luxury recliner seating and IMAX 70mm audio.</p>
        <div className="mt-6 inline-flex flex-wrap gap-4 rounded-2xl bg-surface-container-low/80 border border-white/5 px-4 py-3 text-label-md text-on-surface">
          <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-secondary" aria-hidden />Dolby Atmos Sound</span><span className="flex items-center gap-2"><ScanLine className="w-4 h-4 text-secondary" aria-hidden />Instant E-Tickets</span><span className="flex items-center gap-2"><Timer className="w-4 h-4 text-secondary" aria-hidden />Zero Queues</span></div>
      </div>) }}>
      <div className="card overflow-hidden border-t-2 !border-t-primary-container p-6 sm:p-8 !rounded-2xl">
        <div className="flex items-center gap-3 mb-5"><LogoMark size="lg" /><div className="leading-tight"><p className="font-headline text-headline-sm font-bold text-white">Cine<span className="text-primary-container">Book</span></p><p className="text-[10px] tracking-[0.18em] text-on-surface-variant">LUXE CLUB</p></div></div>
        <h2 className="font-headline text-headline-md text-white">Welcome Back</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Enter your credentials to access your tickets and loyalty perks.</p>
        {formError && <div role="alert" className="mt-4 rounded-xl border border-error/40 bg-error-container/30 px-4 py-3 text-body-sm text-on-error-container flex gap-2"><ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />{formError}</div>}
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Field label="Email Address" type="email" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" autoComplete="email" />
          <PasswordField label="Password" icon={Lock} value={form.password} onChange={set('password')} error={errors.password} placeholder="Your password" autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3">
            <Checkbox label="Remember me for 30 days" checked={form.remember} onChange={set('remember')} />
            <button type="button" onClick={() => setForgot(true)} className="text-label-md text-primary hover:underline shrink-0">Forgot password?</button>
          </div>
          <Button type="submit" className="w-full !py-3.5 !text-body-md" loading={status === 'loading'} loadingText="Signing in…" iconRight={status === 'success' ? Check : ArrowRight} disabled={status === 'success'}>{status === 'success' ? 'Signed in' : 'Sign In to Account'}</Button>
        </form>
        <button onClick={fillDemo} type="button" className="mt-3 w-full text-center text-label-sm text-on-surface-variant hover:text-white">Demo account: <span className="text-secondary">customer@cinebook.com</span> / password123 — <u>fill it in</u></button>
        <div className="my-4 flex items-center gap-3 text-label-sm text-on-surface-variant"><span className="h-px flex-1 bg-white/10" />OR<span className="h-px flex-1 bg-white/10" /></div>
        <Button variant="secondary" className="w-full !py-3.5" icon={User} onClick={continueGuest}>Continue as Guest</Button>
        <p className="mt-5 text-center text-body-md text-on-surface-variant">Don’t have an account? <Link to="/register" state={{ from }} className="text-primary font-semibold underline underline-offset-4">Create Account</Link></p>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-3.5">
          <div className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-surface-container-high grid place-items-center"><ShieldCheck className="w-4 h-4 text-secondary" aria-hidden /></span><div><p className="text-label-md text-white">Theater Operations?</p><p className="text-body-sm text-on-surface-variant">Circuit box-office &amp; screen console</p></div></div>
          <Link to="/admin/login" className="btn-secondary btn-sm shrink-0">Admin Login<ArrowRight className="w-3.5 h-3.5" aria-hidden /></Link>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-label-sm text-on-surface-variant px-1"><span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" aria-hidden />256-Bit SSL Ticket Encryption</span><span className="flex gap-3"><button onClick={() => toast.info('Terms of Service open in a later release.')} className="hover:text-white">Terms</button><button onClick={() => toast.info('Privacy Policy opens in a later release.')} className="hover:text-white">Privacy</button><button onClick={() => toast.info('Help center opens in a later release.')} className="hover:text-white">Help</button></span></div>
      <ForgotPasswordModal open={forgot} onClose={() => setForgot(false)} initialEmail={form.email} />
    </AuthShell>
  );
}
