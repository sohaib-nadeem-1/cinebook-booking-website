import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Home, Printer, Ticket as TicketIcon } from 'lucide-react';
import Ticket from '../../components/booking/Ticket.jsx';
import Button from '../../components/common/Button.jsx';
import { EmptyState, ErrorState, PageLoader } from '../../components/common/States.jsx';
import { bookingService } from '../../services/bookingService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';
import { downloadTicket } from '../../utils/ticketFile.js';
import { store } from '../../utils/storage.js';
import { formatDate, money, time12 } from '../../utils/format.js';

export default function ConfirmationPage() {
  useDocTitle('Booking confirmed');
  const { state } = useLocation(); const toast = useToast();
  const id = state?.id || store.get('lastBookingId');
  const { data: b, loading, error } = useAsync(() => (id ? bookingService.get(id) : null), [id]);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  if (!id) return <div className="max-w-xl mx-auto py-16 px-4"><EmptyState icon={TicketIcon} title="No recent booking" message="Complete a booking to see your digital ticket here." action={<Link to="/movies" className="btn-primary">Browse movies</Link>} /></div>;
  if (loading) return <PageLoader label="Loading your ticket…" />;
  if (error || !b) return <ErrorState title="Booking not found" message={error?.message} />;
  const download = () => { downloadTicket(b); toast.success('Ticket downloaded. Open the file to print or save as PDF.'); };
  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin py-10 print:p-0">
      <div className="text-center print:hidden"><span className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 grid place-items-center"><CheckCircle2 className="w-9 h-9 text-emerald-300" aria-hidden /></span>
        <h1 className="mt-4 font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white">You’re going to the movies!</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Booking <b className="text-white">{b.id}</b> is confirmed. A receipt for {money(b.total)} was sent to {b.customer.email} <span className="text-on-surface-variant/60">(demo — no email sent)</span>.</p></div>
      <Ticket booking={b} className="mt-8" />
      <p className="mt-3 text-center text-body-sm text-on-surface-variant print:hidden">{formatDate(b.date, { long: true })} at {time12(b.start)}. Arrive 15 minutes early and show this ticket at the gate.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <Button icon={Download} onClick={download}>Download Ticket</Button>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
        <Link to="/my-bookings" className="btn-secondary"><TicketIcon className="w-4 h-4" aria-hidden />View My Bookings</Link>
        <Link to="/" className="btn-ghost"><Home className="w-4 h-4" aria-hidden />Back to Home</Link></div>
    </div>
  );
}
