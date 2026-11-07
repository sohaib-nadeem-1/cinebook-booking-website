import { useEffect, useMemo, useState } from 'react';
import { Award, Download, Eye, Film, Pencil, Plus, Power, RefreshCw, ShieldAlert, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination, { paginate } from '../../components/common/Pagination.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import Modal, { ConfirmDialog } from '../../components/common/Modal.jsx';
import { Field, Select, SearchInput } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState } from '../../components/common/States.jsx';
import { userService } from '../../services/userService.js';
import { logAudit } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryState } from '../../hooks/useQueryState.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { ROLES } from '../../data/users.js';
import { downloadCsv } from '../../utils/csv.js';
import { formatDate, money } from '../../utils/format.js';

const PER = 6;
const roleBadge = (r) => <Badge tone={ROLES[r].tone} icon={r === 'vip' ? Award : undefined}>{ROLES[r].label}</Badge>;
const EMPTY = { name: '', email: '', phone: '', role: 'customer', status: 'active' };

function UserForm({ open, user, onClose, onSaved }) {
  const toast = useToast(); const editing = !!user; const [f, setF] = useState(EMPTY); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setF(user ? { name: user.name, email: user.email, phone: user.phone || '', role: user.role, status: user.status } : EMPTY); setErrors({}); } }, [open, user]);
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const u = editing ? await userService.update(user.id, f) : await userService.create(f); toast.success(editing ? `${u.name} updated successfully` : `${u.name} added successfully`); onSaved(u, editing); }
    catch (err) { if (err.errors) setErrors(err.errors); toast.error(err.errors ? 'Please fix the highlighted fields.' : 'Unable to complete this action'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} dismissable={!busy} size="md" title={editing ? `Edit ${user.name}` : 'Add new user'} description={editing ? undefined : 'New accounts start with the demo password “password123”.'}
      footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="user-form" loading={busy} loadingText="Saving…">{editing ? 'Save changes' : 'Add user'}</Button></>}>
      <form id="user-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
        <Field className="sm:col-span-2" label="Full name" value={f.name} onChange={set('name')} error={errors.name} required data-autofocus />
        <Field label="Email" type="email" value={f.email} onChange={set('email')} error={errors.email} required /><Field label="Phone" type="tel" value={f.phone} onChange={set('phone')} error={errors.phone} />
        <Select label="Role" value={f.role} onChange={set('role')} error={errors.role}>{Object.entries(ROLES).map(([v, r]) => <option key={v} value={v}>{r.long}</option>)}</Select>
        <Select label="Status" value={f.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></Select>
      </form>
    </Modal>
  );
}

export default function AdminUsersPage() {
  useDocTitle('Users management');
  const { admin } = useAuth(); const toast = useToast();
  const [f, set, reset] = useQueryState({ q: '', role: '', status: '', page: '1' });
  const [text, setText] = useState(f.q); const dq = useDebounce(text, 250);
  useEffect(() => { if (dq !== f.q) set({ q: dq, page: '1' }); }, [dq]); // eslint-disable-line
  useEffect(() => { setText(f.q); }, [f.q]);
  const { data, loading, error, reload } = useAsync(() => userService.list({ search: f.q, role: f.role, status: f.status }), [f.q, f.role, f.status]);
  const sum = useAsync(() => userService.summary(), [data]);
  const [form, setForm] = useState({ open: false, user: null }); const [view, setView] = useState(null); const [del, setDel] = useState(null); const [busy, setBusy] = useState(false); const [toggling, setToggling] = useState(null);
  const list = data || []; const page = Math.min(Number(f.page) || 1, Math.max(1, Math.ceil(list.length / PER))); const { rows, pages } = paginate(list, page, PER);
  const self = (u) => u.id === admin.id;

  const toggle = async (u) => {
    if (self(u)) return toast.warning('You can’t deactivate your own account.');
    setToggling(u.id); const next = u.status === 'active' ? 'inactive' : 'active';
    try { await userService.setStatus(u.id, next); logAudit(admin.name, `${next === 'active' ? 'Activated' : 'Deactivated'} user ${u.email}`); toast.success(`${u.name} ${next === 'active' ? 'activated' : 'deactivated'}`); reload(true); } catch { toast.error('Unable to complete this action'); } finally { setToggling(null); }
  };
  const remove = async () => { setBusy(true); try { await userService.remove(del.id); logAudit(admin.name, `Deleted user ${del.email}`); toast.success(`${del.name} deleted`); setDel(null); reload(true); } catch (e) { toast.error(e.message); } finally { setBusy(false); } };
  const exportCsv = () => (downloadCsv('cinebook-users.csv', list.map((u) => ({ name: u.name, email: u.email, role: ROLES[u.role].long, status: u.status, joined: u.joinedAt, bookings: u.bookings, spent: u.spent.toFixed(2) }))) ? toast.success(`Exported ${list.length} users.`) : toast.warning('No users to export.'));
  const clear = () => { reset(); setText(''); };

  const cols = [
    { key: 'u', header: 'Avatar & user', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} src={u.avatar} /><div><p className="text-white font-semibold flex items-center gap-1.5">{u.name}{u.role === 'system_admin' && <ShieldAlert className="w-3.5 h-3.5 text-[#ff8a80]" aria-label="System admin" />}{u.role === 'vip' && <Award className="w-3.5 h-3.5 text-secondary" aria-label="VIP" />}{self(u) && <span className="text-[10px] text-secondary">(you)</span>}</p><p className="text-label-sm text-on-surface-variant">@{u.handle}</p></div></div> },
    { key: 'e', header: 'Email', render: (u) => <span className="text-on-surface">{u.email}</span> },
    { key: 'r', header: 'Role', render: (u) => roleBadge(u.role) },
    { key: 's', header: 'Status', render: (u) => <Badge tone={u.status === 'active' ? 'green' : 'slate'} dot>{u.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
    { key: 'j', header: 'Joined', render: (u) => <span className="whitespace-nowrap">{formatDate(u.joinedAt, { year: true })}</span> },
    { key: 'b', header: 'Total bookings', render: (u) => <><b className="text-white">{u.bookings} Bookings</b><p className="text-label-sm text-on-surface-variant">{money(u.spent)} spent</p></> },
    { key: 'a', header: 'Actions', headerClass: 'text-right', render: (u) => <div className="flex justify-end gap-0.5"><IconButton icon={Eye} label={`View ${u.name}`} onClick={() => setView(u)} /><IconButton icon={Pencil} label={`Edit ${u.name}`} onClick={() => setForm({ open: true, user: u })} /><IconButton icon={Power} label={u.status === 'active' ? `Deactivate ${u.name}` : `Activate ${u.name}`} disabled={toggling === u.id} onClick={() => toggle(u)} /><IconButton icon={Trash2} tone="danger" label={`Delete ${u.name}`} disabled={self(u)} onClick={() => setDel(u)} /></div> },
  ];
  if (error) return <ErrorState onRetry={reload} />;
  return (
    <div>
      <AdminPageHeader eyebrow="User directory & RBAC" title="Users Management" description="Manage system administrators, box office staff, and registered customer accounts across the theater circuit.">
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button><Button icon={UserPlus} onClick={() => setForm({ open: true, user: null })}>Add New User</Button></AdminPageHeader>
      <section aria-label="User metrics" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-gutter-mobile md:gap-gutter mb-gutter"><StatCard label="Total accounts" value={sum.data?.total ?? '—'} icon={UsersIcon} sub="Across all roles" /><StatCard label="Active customers" value={sum.data?.active ?? '—'} icon={Film} sub="Customer & VIP accounts" /><StatCard label="VIP members" value={sum.data?.vip ?? '—'} icon={Award} tone="gold" sub="Recliner & Dolby tier pass" /><StatCard label="System admins" value={sum.data?.admins ?? '—'} icon={ShieldAlert} sub="Privileged • 2FA mandatory in production" /></section>
      <div className="panel p-4 flex flex-wrap items-center gap-3"><SearchInput className="flex-1 min-w-[220px]" value={text} onChange={setText} placeholder="Search by user name, email, or customer ID…" label="Search users" />
        <Select aria-label="Filter by role" value={f.role} onChange={(e) => set({ role: e.target.value, page: '1' })} className="w-48"><option value="">Role: All Roles</option>{Object.entries(ROLES).map(([v, r]) => <option key={v} value={v}>{r.long}</option>)}</Select>
        <Select aria-label="Filter by status" value={f.status} onChange={(e) => set({ status: e.target.value, page: '1' })} className="w-44"><option value="">Status: All</option><option value="active">Active</option><option value="inactive">Inactive</option></Select>
        <IconButton icon={RefreshCw} label="Reset filters and refresh" onClick={() => { clear(); reload(); }} /></div>
      <div className="mt-4 panel overflow-hidden"><DataTable caption="Users" columns={cols} rows={rows} loading={loading && !data} minWidth={980} empty={<EmptyState icon={UsersIcon} title="No users found" message="No accounts match your search or filters." action={<div className="flex gap-2"><Button variant="secondary" onClick={clear}>Clear filters</Button><Button icon={Plus} onClick={() => setForm({ open: true, user: null })}>Add user</Button></div>} />} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 text-body-sm text-on-surface-variant"><span>{list.length ? <>Showing <b className="text-white">{rows.length}</b> of <b className="text-white">{list.length}</b> accounts</> : 'No accounts'}</span><Pagination page={page} pages={pages} onChange={(p) => set({ page: String(p) })} /></div></div>
      <UserForm open={form.open} user={form.user} onClose={() => setForm({ open: false, user: null })} onSaved={(u, ed) => { logAudit(admin.name, `${ed ? 'Edited' : 'Added'} user ${u.email}`); setForm({ open: false, user: null }); reload(true); }} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} danger title={`Delete ${del?.name}?`} confirmText="Delete user" message="This permanently removes the account. Their past bookings remain in the audit ledger. This can’t be undone." />
      <Modal open={!!view} onClose={() => setView(null)} variant="drawer" title={view?.name || ''} description="User profile" footer={view && <><Button variant="secondary" onClick={() => setView(null)}>Close</Button><Button icon={Pencil} onClick={() => { const u = view; setView(null); setForm({ open: true, user: u }); }}>Edit</Button></>}>
        {view && <div className="space-y-4"><div className="flex items-center gap-4"><Avatar name={view.name} src={view.avatar} size="lg" /><div>{roleBadge(view.role)}<p className="mt-1 text-body-sm text-on-surface-variant">@{view.handle}</p></div></div>
          <dl className="grid grid-cols-2 gap-3 text-body-sm">{[['Email', view.email], ['Phone', view.phone || '—'], ['Status', view.status], ['Joined', formatDate(view.joinedAt, { year: true })], ['Bookings', view.bookings], ['Total spent', money(view.spent)]].map(([k, v]) => <div key={k} className="rounded-lg bg-surface-container-lowest/70 p-3"><dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">{k}</dt><dd className="text-white break-words">{v}</dd></div>)}</dl>
          <p className="text-body-sm text-on-surface-variant">{['system_admin'].includes(view.role) ? 'Full access: dashboard, catalog, showtimes, bookings & refunds, users and settings.' : view.role === 'box_office' ? 'Can view dashboard, manage catalog and showtimes, and handle bookings. Cannot delete movies, manage users or change settings.' : 'Customer account — can book tickets, view bookings and edit their profile.'}</p></div>}
      </Modal>
    </div>
  );
}
