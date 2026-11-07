import Modal from '../common/Modal.jsx';
import Badge, { STATUS_TONE } from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Ticket from '../booking/Ticket.jsx';
import { money, formatDate } from '../../utils/format.js';

const Row = ({ k, v }) => <div className="flex justify-between gap-4 py-1.5 text-body-sm"><dt className="text-on-surface-variant">{k}</dt><dd className="text-white text-right">{v}</dd></div>;

/** Read-only booking inspection (receipt + ticket) shared by dashboard and bookings ledger. */
export default function BookingDetailModal({ booking: b, onClose, actions }) {
  return (
    <Modal open={!!b} onClose={onClose} size="lg" title={b ? `Booking ${b.id}` : ''} description={b && `${b.customer.name} • ${b.customer.email}`} footer={<>{actions}<Button variant="secondary" onClick={onClose}>Close</Button></>}>
      {b && (<div className="space-y-5"><Ticket booking={b} />
        <div className="grid sm:grid-cols-2 gap-5"><dl className="rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4"><Row k="Status" v={<Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>} /><Row k="Phone" v={b.customer.phone} /><Row k="Payment" v={`${b.paymentMethod} (demo)`} /><Row k="Booked" v={formatDate(b.createdAt.slice(0, 10), { year: true })} />{b.refund && <Row k="Refund" v={`${money(b.refund.amount)} • ${b.refund.state}`} />}</dl>
          <dl className="rounded-xl bg-surface-container-lowest/70 border border-white/5 p-4">{b.pricing.lines.map((l) => <Row key={l.tier} k={`${l.qty} × ${l.tier} seat`} v={money(l.total)} />)}{b.pricing.concessions > 0 && <Row k="Concessions" v={money(b.pricing.concessions)} />}<Row k="Service fee" v={money(b.pricing.serviceFee)} /><Row k={`Tax (${b.pricing.taxRate}%)`} v={money(b.pricing.tax)} /><div className="border-t border-white/10 mt-2 pt-2"><Row k={<b className="text-white">Total</b>} v={<b className="text-secondary">{money(b.total)}</b>} /></div></dl></div></div>)}
    </Modal>
  );
}
