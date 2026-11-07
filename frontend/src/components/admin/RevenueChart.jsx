import { money } from '../../utils/format.js';

/** Dependency-free SVG chart: paired bars (box office / concessions) + smoothed trend line over box office. */
export default function RevenueChart({ series }) {
  const W = 640; const H = 280; const pad = { l: 8, r: 8, t: 24, b: 34 };
  const n = series.labels.length; const max = Math.max(...series.box, ...series.food) * 1.12;
  const bw = Math.min(26, (W - pad.l - pad.r) / n / 3); const step = (W - pad.l - pad.r) / n;
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max); const cx = (i) => pad.l + step * (i + 0.5);
  const peak = series.box.indexOf(Math.max(...series.box));
  const pts = series.box.map((v, i) => [cx(i), y(v)]);
  const path = pts.reduce((d, p, i) => { if (!i) return `M${p[0]},${p[1]}`; const q = pts[i - 1]; const mx = (q[0] + p[0]) / 2; return `${d} C${mx},${q[1]} ${mx},${p[1]} ${p[0]},${p[1]}`; }, '');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Revenue chart. Box office peaks at ${money(Math.max(...series.box))} on ${series.labels[peak]}.`}>
      <defs>
        <linearGradient id="gBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e50914" /><stop offset="1" stopColor="#7a0a10" /></linearGradient>
        <linearGradient id="gFood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb95f" /><stop offset="1" stopColor="#8a5a1a" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={y((max / 1.12) * t)} y2={y((max / 1.12) * t)} stroke="#fff" strokeOpacity="0.06" strokeDasharray="3 5" />)}
      {series.box.map((v, i) => (
        <g key={series.labels[i]}>
          <rect x={cx(i) - bw - 1} y={y(v)} width={bw} height={H - pad.b - y(v)} rx="3" fill="url(#gBox)"><title>{`${series.labels[i]} box office: ${money(v)}`}</title></rect>
          <rect x={cx(i) + 1} y={y(series.food[i])} width={bw} height={H - pad.b - y(series.food[i])} rx="3" fill="url(#gFood)"><title>{`${series.labels[i]} concessions: ${money(series.food[i])}`}</title></rect>
          <text x={cx(i)} y={H - 10} textAnchor="middle" fontSize="12" fill={i === peak ? '#ffb4aa' : '#9a8f8d'} fontWeight={i === peak ? 700 : 500}>{series.labels[i]}</text>
        </g>))}
      <path d={path} fill="none" stroke="#ffe3dc" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <circle cx={pts[peak][0]} cy={pts[peak][1]} r="5" fill="#111319" stroke="#ff8a80" strokeWidth="2.5" />
    </svg>
  );
}
