import { db } from './db.js';
import { simulate, ApiError } from './api.js';
import { isEmail, isPhone } from '../utils/validators.js';
import { slugify, todayKey, uid } from '../utils/format.js';

const strip = ({ password, ...u }) => u;
const withStats = (u) => {
  const live = db.bookings.all().filter((b) => (b.userId === u.id || b.customer.email === u.email) && !['cancelled', 'refunded'].includes(b.status));
  return { ...strip(u), bookings: live.length, spent: live.reduce((a, b) => a + b.total, 0) };
};
const validate = (d, all, id) => {
  const e = {};
  if (!d.name?.trim()) e.name = 'Name is required';
  if (!isEmail(d.email)) e.email = 'Enter a valid email';
  else if (all.some((u) => u.id !== id && u.email.toLowerCase() === d.email.toLowerCase())) e.email = 'That email is already in use';
  if (d.phone && !isPhone(d.phone)) e.phone = 'Enter a valid phone number';
  if (!d.role) e.role = 'Select a role';
  return e;
};

export const userService = {
  list: ({ search = '', role, status } = {}) => simulate(() => {
    const q = search.trim().toLowerCase();
    return db.users.all().filter((u) => (!role || u.role === role) && (!status || u.status === status)
      && (!q || `${u.name} ${u.email} ${u.handle} ${u.id}`.toLowerCase().includes(q))).map(withStats);
  }, 250),
  create: (d) => simulate(() => {
    const all = db.users.all(); const errors = validate(d, all);
    if (Object.keys(errors).length) throw Object.assign(new ApiError('Please fix the highlighted fields.', 'VALIDATION'), { errors });
    const u = { id: uid('u'), handle: slugify(d.name).replace(/-/g, '_'), password: 'password123', status: 'active', joinedAt: todayKey(), phone: '', ...d };
    db.users.save([...all, u]); return withStats(u);
  }),
  update: (id, d) => simulate(() => {
    const all = db.users.all(); const errors = validate(d, all, id);
    if (Object.keys(errors).length) throw Object.assign(new ApiError('Please fix the highlighted fields.', 'VALIDATION'), { errors });
    db.users.save(all.map((u) => (u.id === id ? { ...u, name: d.name.trim(), email: d.email.trim(), phone: d.phone?.trim() || '', role: d.role, status: d.status ?? u.status } : u)));
    return withStats(db.users.all().find((u) => u.id === id));
  }),
  setStatus: (id, status) => simulate(() => {
    const all = db.users.all(); db.users.save(all.map((u) => (u.id === id ? { ...u, status } : u))); return withStats(db.users.all().find((u) => u.id === id));
  }, 300),
  remove: (id) => simulate(() => {
    const all = db.users.all(); if (!all.some((u) => u.id === id)) throw new ApiError('User not found.', 'NOT_FOUND');
    db.users.save(all.filter((u) => u.id !== id)); return { id };
  }),
  summary: () => simulate(() => {
    const u = db.users.all();
    return { total: u.length, active: u.filter((x) => x.status === 'active' && ['customer', 'vip'].includes(x.role)).length, vip: u.filter((x) => x.role === 'vip').length, admins: u.filter((x) => x.role === 'system_admin').length };
  }, 120),
};
