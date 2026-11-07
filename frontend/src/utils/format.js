export const money = (n, currency = "PKR") => {
  const amount = Number(n) || 0;

  if (currency === "PKR") {
    return `Rs. ${new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const pad = (n) => String(n).padStart(2, "0");

/** Local YYYY-MM-DD (never UTC, so "today" matches the viewer's calendar). */
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseDateKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const todayKey = () => dateKey(new Date());

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const dayShort = (key) => DAYS[parseDateKey(key).getDay()];
export const monthShort = (key) => MONTHS[parseDateKey(key).getMonth()];
export const dayNum = (key) => parseDateKey(key).getDate();

export const formatDate = (key, opts = {}) => {
  if (!key) return "—";

  const d = parseDateKey(key);
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`;

  if (opts.long) {
    return `${[
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ][d.getDay()]}, ${base}`;
  }

  if (opts.year) return `${base}, ${d.getFullYear()}`;
  if (opts.weekday) return `${DAYS[d.getDay()]}, ${base}`;

  return base;
};

export const relativeDay = (key) => {
  const t = todayKey();

  if (key === t) return "Today";
  if (key === addDays(t, 1)) return "Tomorrow";

  return formatDate(key, { weekday: true });
};

export const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

export const time12 = (hhmm) => {
  if (!hhmm) return "—";

  const [h, m] = hhmm.split(":").map(Number);

  return `${pad(((h + 11) % 12) + 1)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
};

export const duration = (mins) =>
  `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;

export const showDateTime = (date, start) =>
  new Date(`${date}T${start}:00`);

export const hash = (str) => {
  let h = 2166136261;

  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return (h >>> 0) / 4294967295;
};

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export const cx = (...c) => c.filter(Boolean).join(" ");