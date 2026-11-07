import { useEffect, useRef, useState } from 'react';
import { Bell, Building2, Camera, ChevronDown, Cpu, History, Mail, MapPin, Moon, Network, Percent, Phone, Save, Sun, Trash2, User, Briefcase, Sliders, Lock, RotateCcw } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Badge from '../../components/common/Badge.jsx';
import { Field, PasswordField, Select, Toggle } from '../../components/common/Field.jsx';
import { PageLoader } from '../../components/common/States.jsx';
import { settingsService, DEFAULT_SETTINGS } from '../../services/settingsService.js';
import { authService } from '../../services/authService.js';
import { adminService, logAudit } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { isEmail, isPhone } from '../../utils/validators.js';

const TZ = ['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Karachi', 'Asia/Tokyo'];
const CUR = [['USD', 'USD ($) - US Dollar'], ['EUR', 'EUR (€) - Euro'], ['GBP', 'GBP (£) - British Pound'], ['PKR', 'PKR (Rs) - Pakistani Rupee']];
const NOTIFS = [['newBooking', 'New Booking Alerts', 'URGENT', 'Notify box office team immediately upon instant high-volume ticket bookings or sell-out clusters.'], ['cancellation', 'Booking Cancellation & Refund Requests', 'CRITICAL', 'Send rapid alert when a customer requests ticket return under the 2-hour pre-showtime threshold window.'], ['newUser', 'New User Registrations', '', 'Daily automated digest and analytical breakdown of new cinephile account registrations.'], ['telemetry', 'System & Telemetry Alerts', 'PRIORITY', 'Immediate notification on projection rig latency, laser lamp degradation, or TMS API socket disconnects.']];

const Card = ({ icon: Icon, title, desc, badge, children, tint = 'text-[#ff8a80] bg-primary-container/15' }) => (
  <section className="panel overflow-hidden"><header className="flex items-center justify-between gap-3 p-5 border-b border-white/5"><div className="flex items-center gap-3"><span className={`w-10 h-10 rounded-xl grid place-items-center ${tint}`}><Icon className="w-5 h-5" aria-hidden /></span><div><h2 className="font-headline text-headline-sm text-white">{title}</h2><p className="text-body-sm text-on-surface-variant">{desc}</p></div></div>{badge}</header><div className="p-5 md:p-6">{children}</div></section>);

function Telemetry() {
  const [t, setT] = useState({ storage: 14.2, bw: 94.1, lat: 0.012 });
  useEffect(() => { const id = setInterval(() => setT((x) => ({ storage: 14.2, bw: Math.max(88, Math.min(97, x.bw + (Math.random() - 0.5) * 2)), lat: Math.max(0.008, Math.min(0.02, x.lat + (Math.random() - 0.5) * 0.002)) })), 2500); return () => clearInterval(id); }, []);
  return (<div className="space-y-4"><div><div className="flex justify-between text-label-sm"><span className="text-on-surface-variant">Storage Allocation (DCP Vault)</span><b className="text-secondary">{t.storage} TB / 18.0 TB</b></div><div className="mt-1.5 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-secondary" style={{ width: `${(t.storage / 18) * 100}%` }} /></div></div>
    <div><div className="flex justify-between text-label-sm"><span className="text-on-surface-variant">Projection Rig Bandwidth</span><b className="text-[#ff8a80]">{t.bw.toFixed(1)}% Peak Load</b></div><div className="mt-1.5 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-primary-container transition-all duration-700" style={{ width: `${t.bw}%` }} /></div></div>
    <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest/70 border border-white/5 p-3 text-label-sm"><span className="flex items-center gap-2 text-on-surface"><Cpu className="w-4 h-4 text-emerald-300" aria-hidden />TMS Sync Engine</span><b className="text-emerald-300 tabular-nums">{t.lat.toFixed(3)} ms Latency</b></div>
    <p className="text-label-sm text-on-surface-variant">Simulated telemetry for the frontend demo — not connected to real hardware.</p></div>);
}

export default function SettingsPage() {
  useDocTitle('Platform settings');
  const { admin, refresh } = useAuth(); const toast = useToast(); const fileRef = useRef(null);
  const { data, loading } = useAsync(() => settingsService.get(), []);
  const [s, setS] = useState(null); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  const [pwOpen, setPwOpen] = useState(false); const [pw, setPw] = useState({ current: '', next: '', confirm: '' }); const [pwErr, setPwErr] = useState({}); const [pwBusy, setPwBusy] = useState(false);
  const [audit, setAudit] = useState(false); const [avatar, setAvatar] = useState(null);
  useEffect(() => { if (data && !s) setS({ ...data, profile: { ...data.profile, name: admin.name, email: admin.email, phone: admin.phone || data.profile.phone } }); }, [data]); // eslint-disable-line
  if (loading || !s) return <PageLoader label="Loading settings…" />;
  const upd = (group, key, v) => { setS((x) => ({ ...x, [group]: { ...x[group], [key]: v } })); setDirty(true); setErrors((e) => ({ ...e, [`${group}.${key}`]: '' })); };
  const inp = (g, k) => ({ value: s[g][k], onChange: (e) => upd(g, k, e.target.value), error: errors[`${g}.${k}`] });

  const save = async () => {
    const er = {};
    if (!s.profile.name.trim()) er['profile.name'] = 'Name is required'; if (s.profile.phone && !isPhone(s.profile.phone)) er['profile.phone'] = 'Enter a valid phone number';
    if (!s.cinema.name.trim()) er['cinema.name'] = 'Franchise name is required'; if (!s.cinema.address.trim()) er['cinema.address'] = 'Address is required';
    const tax = Number(s.cinema.taxRate); if (Number.isNaN(tax) || tax < 0 || tax > 30) er['cinema.taxRate'] = 'Enter a rate between 0 and 30';
    const sys = s.system; if (!(Number(sys.serviceFee) >= 0)) er['system.serviceFee'] = 'Must be 0 or more'; if (!(Number(sys.turnaroundMinutes) >= 0 && Number(sys.turnaroundMinutes) <= 120)) er['system.turnaroundMinutes'] = '0–120 minutes'; if (!(Number(sys.holdMinutes) >= 1 && Number(sys.holdMinutes) <= 30)) er['system.holdMinutes'] = '1–30 minutes'; if (!(Number(sys.refundWindowHours) >= 0)) er['system.refundWindowHours'] = 'Must be 0 or more';
    setErrors(er); if (Object.keys(er).length) return toast.error('Please fix the highlighted fields.');
    setBusy(true);
    try {
      const next = { ...s, cinema: { ...s.cinema, taxRate: tax }, system: { ...sys, serviceFee: Number(sys.serviceFee), turnaroundMinutes: Number(sys.turnaroundMinutes), holdMinutes: Number(sys.holdMinutes), refundWindowHours: Number(sys.refundWindowHours) } };
      await settingsService.save(next); document.documentElement.dataset.density = next.system.highDensity ? 'compact' : 'comfortable'; logAudit(admin.name, 'Updated platform settings'); setDirty(false); toast.success('Settings saved successfully');
    } catch { toast.error('Unable to complete this action'); } finally { setBusy(false); }
  };
  const reset = async () => { const d = await settingsService.reset(); setS({ ...d, profile: { ...d.profile, name: admin.name, email: admin.email } }); setDirty(false); setErrors({}); logAudit(admin.name, 'Reset settings to defaults'); toast.info('Settings restored to defaults.'); };
  const pickFile = (e) => { const f = e.target.files?.[0]; if (!f) return; if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return toast.error('Use a PNG, JPG or WebP image.'); if (f.size > 5 * 1024 * 1024) return toast.error('Image must be 5MB or smaller.'); setAvatar(URL.createObjectURL(f)); setDirty(true); toast.success('Avatar updated for this session.'); };
  const savePw = async (e) => {
    e.preventDefault(); const er = {};
    if (!pw.current) er.current = 'Enter your current password'; if (pw.next.length < 8) er.next = 'Use at least 8 characters'; if (pw.confirm !== pw.next) er.confirm = 'Passwords do not match';
    setPwErr(er); if (Object.keys(er).length) return; setPwBusy(true);
    try { await authService.changePassword(admin.id, pw); toast.success('Password changed.'); setPwOpen(false); setPw({ current: '', next: '', confirm: '' }); } catch (err) { setPwErr(err.errors || {}); toast.error(err.message); } finally { setPwBusy(false); }
  };

  return (
    <div>
      <AdminPageHeader eyebrow="System configuration • v4.8.2-demo" title="Platform Settings" description="Configure cinema franchise profiles, operating complexes, notification engines, and theatrical system preferences.">
        <Button variant="secondary" icon={History} onClick={() => setAudit(true)}>Audit Log</Button><Button variant="ghost" icon={RotateCcw} onClick={reset}>Reset</Button>
        <Button icon={Save} onClick={save} loading={busy} loadingText="Saving…">Save Changes{dirty ? ' •' : ''}</Button></AdminPageHeader>
      <div className="grid gap-gutter xl:grid-cols-[1fr_380px] items-start">
        <div className="space-y-gutter">
          <Card icon={User} title="Admin Profile" desc="Manage identity credentials and supervisory contact records." badge={<Badge tone="gold">{admin.role === 'system_admin' ? 'Super Admin' : 'Box Office'}</Badge>}>
            <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4"><Avatar name={admin.name} src={avatar || admin.avatar} size="lg" /><div className="flex-1 min-w-[180px]"><p className="text-title-md text-white">Profile Photo</p><p className="text-body-sm text-on-surface-variant">Recommended 400×400px. PNG, JPG or WebP up to 5MB.</p></div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={pickFile} aria-label="Upload avatar" /><Button variant="secondary" size="sm" icon={Camera} onClick={() => fileRef.current?.click()}>Change Avatar</Button><IconButtonDel disabled={!avatar} onClick={() => { setAvatar(null); toast.info('Avatar removed.'); }} /></div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4"><Field label="Full name" icon={User} required {...inp('profile', 'name')} /><Field label="Email address" icon={Mail} value={admin.email} readOnly hint="Verified — contact a System Admin to change." /><Field label="Phone number" icon={Phone} {...inp('profile', 'phone')} /><Field label="Job title" icon={Briefcase} {...inp('profile', 'title')} /></div>
            <button onClick={() => { setPwErr({}); setPwOpen(true); }} className="mt-5 w-full flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4 text-left hover:bg-surface-container"><span className="flex items-center gap-3"><Lock className="w-5 h-5 text-secondary" aria-hidden /><span><span className="block text-label-md text-white">Change Security Password</span><span className="block text-body-sm text-on-surface-variant">Update box office terminal and administrative login credentials</span></span></span><ChevronDown className="w-5 h-5 text-on-surface-variant" aria-hidden /></button></Card>

          <Card icon={Building2} title="Cinema Information" desc="Franchise properties, tax localization, and primary auditorium hub." tint="text-secondary bg-secondary-container/15" badge={<Badge tone="green" dot>Live node</Badge>}>
            <div className="grid sm:grid-cols-2 gap-4"><Field className="sm:col-span-2" label="Cinema franchise name" icon={Building2} required {...inp('cinema', 'name')} /><Field className="sm:col-span-2" label="Primary complex address" icon={MapPin} required {...inp('cinema', 'address')} /><Field label="Support desk phone" icon={Phone} {...inp('cinema', 'phone')} /><Field label="Standard concession & ticket tax rate (%)" icon={Percent} type="number" step="0.01" min="0" max="30" {...inp('cinema', 'taxRate')} />
              <Select label="Primary transaction currency" value={s.cinema.currency} onChange={(e) => upd('cinema', 'currency', e.target.value)}>{CUR.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select><Select label="Auditorium system timezone" value={s.cinema.timezone} onChange={(e) => upd('cinema', 'timezone', e.target.value)}>{TZ.map((z) => <option key={z}>{z}</option>)}</Select></div></Card>

          <Card icon={Sliders} title="Operations & Booking Rules" desc="Pricing fees, turnaround buffer, seat holds and refunds." tint="text-sky-300 bg-sky-400/15">
            <div className="grid sm:grid-cols-2 gap-4"><Field label="Service fee per ticket ($)" type="number" step="0.25" min="0" {...inp('system', 'serviceFee')} /><Field label="Auditorium turnaround buffer (min)" type="number" min="0" max="120" hint="Cleaning window enforced between screenings." {...inp('system', 'turnaroundMinutes')} /><Field label="Seat hold duration (min)" type="number" min="1" max="30" {...inp('system', 'holdMinutes')} /><Field label="Refund window (hours before show)" type="number" min="0" {...inp('system', 'refundWindowHours')} /></div></Card>

          <Card icon={Bell} title="Notifications & Automation" desc="Live telemetry triggers, box office dispatches, and audit alerts." tint="text-[#ff8a80] bg-primary-container/15" badge={<Badge tone="slate">Webhooks: demo</Badge>}>
            <ul className="divide-y divide-white/5">{NOTIFS.map(([k, label, tag, desc]) => <li key={k} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"><div><label htmlFor={`n-${k}`} className="text-title-md text-white flex flex-wrap items-center gap-2">{label}{tag && <span className="rounded bg-primary-container/25 px-1.5 py-0.5 text-[10px] font-bold text-[#ff8a80]">{tag}</span>}</label><p className="text-body-sm text-on-surface-variant mt-0.5">{desc}</p></div><Toggle id={`n-${k}`} label={label} checked={s.notifications[k]} onChange={(v) => upd('notifications', k, v)} /></li>)}</ul></Card>
        </div>

        <aside className="space-y-gutter">
          <Card icon={Sliders} title="Appearance" desc="Display engine and terminal layout." tint="text-on-surface-variant bg-white/5">
            <p className="field-label">Platform theme</p><div className="grid grid-cols-2 gap-2"><div aria-current="true" className="flex items-center gap-2 rounded-xl border border-primary-container bg-primary-container/10 px-3 py-3 text-label-md text-white"><Moon className="w-4 h-4 text-primary-container" aria-hidden />Cinematic</div><button onClick={() => toast.info('Light mode is locked: the auditorium console mandates low-light projection compliance.')} aria-disabled className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-label-md text-on-surface-variant/60"><Sun className="w-4 h-4" aria-hidden />Light<Lock className="w-3 h-3 ml-auto" aria-hidden /></button></div>
            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4"><div><label htmlFor="density" className="text-label-md text-white">High-Density Mode</label><p className="text-body-sm text-on-surface-variant">Compact rows for rapid ticket desk processing.</p></div><Toggle id="density" label="High-density mode" checked={s.system.highDensity} onChange={(v) => upd('system', 'highDensity', v)} /></div>
            <Select className="mt-4" label="Default auditorium seating layout" value={s.system.seatLayout} onChange={(e) => upd('system', 'seatLayout', e.target.value)}>{['Curved IMAX 70mm Standard', 'Flat Dolby Cinema', 'Stadium Lounge Recliner'].map((x) => <option key={x}>{x}</option>)}</Select>
            <div className="mt-4 rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4 text-center"><div className="flex justify-between text-label-sm"><b className="text-on-surface-variant tracking-wider">HALL 1 SCREEN BEAM</b><b className="text-secondary">90 Seats</b></div><div className="screen-beam mt-3 h-6 flex items-end justify-center"><div className="w-3/4 h-1 rounded-full bg-primary-container shadow-[0_0_14px_3px_rgba(229,9,20,.5)]" /></div><p className="mt-2 text-label-sm text-on-surface-variant">Focal throw distance: 28.4m • Aspect: 1.43:1</p></div></Card>
          <Card icon={Network} title="Rig Infrastructure" desc="Live hardware telemetry metrics." tint="text-secondary bg-secondary-container/15"><Telemetry /></Card>
        </aside>
      </div>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} size="sm" title="Change security password" footer={<><Button variant="secondary" onClick={() => setPwOpen(false)} disabled={pwBusy}>Cancel</Button><Button type="submit" form="apw" loading={pwBusy} loadingText="Updating…">Update password</Button></>}>
        <form id="apw" onSubmit={savePw} noValidate className="space-y-4"><PasswordField label="Current password" value={pw.current} onChange={(e) => { setPw({ ...pw, current: e.target.value }); setPwErr({ ...pwErr, current: '' }); }} error={pwErr.current} data-autofocus /><PasswordField label="New password" value={pw.next} onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwErr({ ...pwErr, next: '' }); }} error={pwErr.next} /><PasswordField label="Confirm new password" value={pw.confirm} onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); setPwErr({ ...pwErr, confirm: '' }); }} error={pwErr.confirm} /></form></Modal>
      <Modal open={audit} onClose={() => setAudit(false)} size="lg" title="Audit log" description="Admin actions recorded in this browser (demo)." footer={<Button variant="secondary" onClick={() => setAudit(false)}>Close</Button>}>
        {adminService.auditList().length === 0 ? <p className="text-on-surface-variant text-center py-6">No admin actions recorded yet. Edits you make will appear here.</p> : <ul className="divide-y divide-white/5">{adminService.auditList().slice(0, 40).map((a) => <li key={a.id} className="py-2.5 flex justify-between gap-4 text-body-sm"><span className="text-white">{a.action}<span className="text-on-surface-variant"> — {a.actor}</span></span><time className="text-on-surface-variant whitespace-nowrap">{new Date(a.at).toLocaleString()}</time></li>)}</ul>}</Modal>
    </div>
  );
}
function IconButtonDel({ onClick, disabled }) { return <button onClick={onClick} disabled={disabled} aria-label="Remove avatar" className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 disabled:opacity-30"><Trash2 className="w-5 h-5" /></button>; }
