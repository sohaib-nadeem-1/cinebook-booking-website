import { AVATARS, IMAGES } from './images.js';

export const ROLES = {
  system_admin: { label: 'Admin', long: 'System Admin', tone: 'red' },
  box_office: { label: 'Box Office Staff', long: 'Box Office Staff', tone: 'slate' },
  vip: { label: 'Customer / VIP', long: 'Customer / VIP', tone: 'gold' },
  customer: { label: 'Customer', long: 'Customer', tone: 'slate' },
};

/**
 * Demo accounts. Passwords are stored in plain text on purpose — this is a frontend
 * simulation and must be replaced by server-side auth (JWT/sessions + hashed passwords).
 */
export const SEED_USERS = [
  { id: 'u-admin', name: 'Marcus Vance', handle: 'mvance_sys', email: 'admin@cinebook.com', password: 'admin123', phone: '+1 (555) 019-2834', role: 'system_admin', status: 'active', joinedAt: '2023-01-14', title: 'Lead Operations Supervisor', avatar: IMAGES.adminAvatar },
  { id: 'u-box', name: 'Jordan Blake', handle: 'jblake_boxoffice', email: 'box@cinebook.com', password: 'box12345', phone: '+1 (555) 019-4410', role: 'box_office', status: 'active', joinedAt: '2024-03-12', title: 'Box Office Lead' },
  { id: 'u-customer', name: 'Alex Turner', handle: 'alex_turner', email: 'customer@cinebook.com', password: 'password123', phone: '+1 (555) 234-5678', role: 'customer', status: 'active', joinedAt: '2024-03-12', city: 'New York' },
  { id: 'u-elena', name: 'Elena Rostova', handle: 'elena_cinema', email: 'elena.rostova@imax-vip.com', password: 'password123', phone: '+1 (555) 301-7712', role: 'vip', status: 'active', joinedAt: '2023-11-03', avatar: AVATARS[1] },
  { id: 'u-sam', name: 'Samantha Wu', handle: 'sam_wu_film', email: 'samantha.wu@gmail.com', password: 'password123', phone: '+1 (555) 482-1190', role: 'customer', status: 'active', joinedAt: '2024-02-19', avatar: AVATARS[2] },
  { id: 'u-devon', name: 'Devon Gallagher', handle: 'dgallagher_ops', email: 'd.gallagher@cineplex-ops.net', password: 'password123', phone: '+1 (555) 660-3321', role: 'box_office', status: 'inactive', joinedAt: '2023-08-10' },
  { id: 'u-chloe', name: 'Chloe Deschanel', handle: 'chloe_screen', email: 'chloe.deschanel@cinereview.org', password: 'password123', phone: '+1 (555) 718-9034', role: 'vip', status: 'active', joinedAt: '2023-09-28', avatar: AVATARS[3] },
  { id: 'u-sarah', name: 'Sarah Lindqvist', handle: 'sarah_l', email: 'sarah.l@nordicfilm.se', password: 'password123', phone: '+46 70 123 4567', role: 'customer', status: 'active', joinedAt: '2024-05-02' },
  { id: 'u-devon2', name: 'Devon Reynolds', handle: 'd_reynolds', email: 'd.reynolds@skyline.org', password: 'password123', phone: '+1 (555) 222-0198', role: 'customer', status: 'active', joinedAt: '2024-06-18' },
  { id: 'u-aisha', name: 'Aisha Khan', handle: 'aisha_k', email: 'aisha.k@solarmedia.io', password: 'password123', phone: '+1 (555) 909-4412', role: 'vip', status: 'active', joinedAt: '2023-12-01' },
  { id: 'u-julian', name: 'Julian Lawrence', handle: 'j_lawrence', email: 'j.lawrence@apexcorp.com', password: 'password123', phone: '+1 (555) 117-6203', role: 'customer', status: 'inactive', joinedAt: '2024-01-22' },
  { id: 'u-priya', name: 'Priya Nair', handle: 'priya_nair', email: 'priya.nair@moviebuffs.in', password: 'password123', phone: '+91 98765 43210', role: 'customer', status: 'active', joinedAt: '2024-07-30' },
  { id: 'u-tom', name: 'Tom Hallett', handle: 'tomh', email: 'tom.hallett@reelhouse.co', password: 'password123', phone: '+44 7700 900123', role: 'vip', status: 'active', joinedAt: '2023-10-15' },
  { id: 'u-nina', name: 'Nina Okafor', handle: 'nina_o', email: 'nina.okafor@frames.app', password: 'password123', phone: '+1 (555) 820-7755', role: 'system_admin', status: 'active', joinedAt: '2023-02-27' },
];

export const DEMO_ACCOUNTS = {
  customer: { email: 'customer@cinebook.com', password: 'password123' },
  admin: { email: 'admin@cinebook.com', password: 'admin123' },
  box: { email: 'box@cinebook.com', password: 'box12345' },
};
