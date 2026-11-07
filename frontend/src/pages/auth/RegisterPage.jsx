import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Cake, Check, Gem, Lock, Mail, Phone, ShieldCheck, Star, User, Zap, KeyRound } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Button from '../../components/common/Button.jsx';
import { Field, PasswordField, Checkbox } from '../../components/common/Field.jsx';
import { LogoMark } from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { IMAGES } from '../../data/images.js';
import { isEmail, isPhone, passwordChecks, passwordStrength, STRENGTH_LABEL } from '../../utils/validators.js';

const METER = ['bg-error', 'bg-error', 'bg-secondary-container', 'bg-emerald-400', 'bg-emerald-400'];

export default function RegisterPage() {
  useDocTitle('Create account');
  const { register, login, isCustomer } = useAuth(); const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const from = loc.state?.from || '/';
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({}); const [formError, setFormError] = useState(''); const [status, setStatus] = useState('idle');
  if (isCustomer && status !== 'success') return <Navigate to="/" replace />;
  const score = passwordStrength(f.password); const checks = passwordChecks(f.password);
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault(); const er = {};
    if (!f.name.trim()) er.name = 'Full name is required'; else if (f.name.trim().length < 2) er.name = 'Enter your full name';
    if (!f.email.trim()) er.email = 'Email address is required'; else if (!isEmail(f.email)) er.email = 'Enter a valid email address';
    if (!f.phone.trim()) er.phone = 'Phone number is required'; else if (!isPhone(f.phone)) er.phone = 'Enter a valid phone number';
    if (!f.password) er.password = 'Create a password'; else if (!checks.length || !checks.symbol) er.password = 'Use 8+ characters including a number or symbol';
    if (!f.confirm) er.confirm = 'Confirm your password'; else if (f.confirm !== f.password) er.confirm = 'Passwords do not match';
    if (!f.terms) er.terms = 'You must accept the Terms and Privacy Policy to continue';
    setErrors(er); if (Object.keys(er).length) return;
    setStatus('loading');
    try {
      await register(f); setStatus('success'); toast.success('Account created. Signing you in…');
      await login({ email: f.email, password: f.password, remember: true }); nav(from, { replace: true });
    } catch (err) { setStatus('idle'); if (err.errors) setErrors(err.errors); else setFormError(err.message); }
  };

  const perks = [[Star, 'Earn 2x rewards on Dolby & IMAX', 'Double loyalty tier credits on all premium large format tickets.'], [Cake, 'Free ticket on your birthday', 'Celebrate with an annual complimentary pass to any standard or 3D auditorium.'], [Zap, 'Priority booking for midnight premieres', '48-hour advanced reserve window before general public release.']];
  return (
    <AuthShell image={IMAGES.registerBg} art={{
      top: (<div className="flex justify-between"><span className="chip bg-surface-container-high/80 text-secondary backdrop-blur"><span className="w-2 h-2 rounded-full bg-secondary" />CINECLUB VIP MEMBERSHIP</span><span className="chip bg-surface-container-high/80 text-white backdrop-blur"><Gem className="w-4 h-4 text-secondary" aria-hidden />Tier 01 Concierge</span></div>),
      bottom: (<div className="max-w-xl"><p className="label-caps text-secondary border-b-2 border-primary-container inline-block pb-1 mb-4">Elevate every screening</p>
        <h1 className="font-headline text-display-hero font-extrabold text-white">Experience Cinema in Pure <span className="text-primary-container">Luxury</span>.</h1>
        <p className="mt-4 text-body-lg text-on-surface-variant max-w-md">Unrivaled auditorium acoustics, laser projection clarity, and ultra-plush recliners curated for true cinephiles.</p>
        <ul className="mt-6 space-y-4 rounded-2xl bg-surface-container-low/80 border border-white/5 p-5">{perks.map(([I, t, d]) => (<li key={t} className="flex gap-4"><span className="w-10 h-10 rounded-lg bg-surface-container-high grid place-items-center shrink-0"><I className="w-5 h-5 text-secondary" aria-hidden /></span><div><p className="text-title-md text-white">{t}</p><p className="text-body-sm text-on-surface-variant">{d}</p></div></li>))}</ul></div>) }}>
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><LogoMark size="lg" /><span className="font-headline text-headline-sm font-bold text-white">Cine<span className="text-primary-container">Book</span></span></div><span className="chip bg-surface-container-high text-on-surface-variant">PASS ID #389</span></div>
      <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-white">Create your account</h1>
      <p className="text-body-md text-on-surface-variant mt-1">Join thousands of cinephiles and reserve prime seats instantly.</p>
      {formError && <div role="alert" className="mt-4 rounded-xl border border-error/40 bg-error-container/30 px-4 py-3 text-body-sm text-on-error-container">{formError}</div>}
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <Field label="Full name" icon={User} value={f.name} onChange={set('name')} error={errors.name} placeholder="Alexander Turner" autoComplete="name" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email address" type="email" icon={Mail} value={f.email} onChange={set('email')} error={errors.email} placeholder="alex.turner@cinema.com" autoComplete="email" />
          <Field label="Phone number" type="tel" icon={Phone} value={f.phone} onChange={set('phone')} error={errors.phone} placeholder="+1 (555) 234-5678" autoComplete="tel" />
        </div>
        <div>
          <PasswordField label="Password" icon={Lock} value={f.password} onChange={set('password')} error={errors.password} placeholder="Create a password" autoComplete="new-password" aria-describedby="pw-meter" />
          <div id="pw-meter" className="mt-2" aria-live="polite">
            <div className="grid grid-cols-4 gap-1.5" aria-hidden>{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1 rounded-full ${i <= score ? METER[score] : 'bg-white/10'}`} />)}</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm">
              <span className={checks.length ? 'text-emerald-300' : 'text-on-surface-variant'}>{checks.length ? '✓' : '○'} At least 8 chars</span>
              <span className={checks.symbol ? 'text-emerald-300' : 'text-on-surface-variant'}>{checks.symbol ? '✓' : '○'} One number or symbol</span>
              <span className="ml-auto text-label-sm font-semibold text-on-surface-variant">{STRENGTH_LABEL[score]}</span></div>
          </div>
        </div>
        <PasswordField label="Confirm password" icon={KeyRound} value={f.confirm} onChange={set('confirm')} error={errors.confirm} placeholder="Re-enter your password" autoComplete="new-password" />
        <Checkbox checked={f.terms} onChange={set('terms')} error={errors.terms} label={<>I agree to the <button type="button" className="underline text-white" onClick={() => toast.info('Terms of Service open in a later release.')}>Terms of Service</button> and <button type="button" className="underline text-white" onClick={() => toast.info('Privacy Policy opens in a later release.')}>Privacy Policy</button>, and consent to booking notifications.</>} />
        <Button type="submit" className="w-full !py-3.5 !text-body-md" loading={status === 'loading'} loadingText="Creating account…" iconRight={status === 'success' ? Check : ArrowRight} disabled={status === 'success'}>{status === 'success' ? 'Account created' : 'Create Account'}</Button>
      </form>
      <p className="mt-5 text-center text-body-md text-on-surface-variant">Already have an account? <Link to="/login" state={{ from }} className="text-primary font-semibold underline underline-offset-4">Login</Link></p>
      <p className="mt-4 flex items-center justify-center gap-4 text-label-sm text-on-surface-variant"><span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" aria-hidden />256-bit SSL Vault</span><span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" aria-hidden />PCI-DSS Certified</span></p>
    </AuthShell>
  );
}
