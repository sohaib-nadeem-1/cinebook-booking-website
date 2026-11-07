
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Download,
  Eye,
  MapPin,
  Ticket as TicketIcon,
  XCircle,
} from "lucide-react";

import Ticket from "../../components/booking/Ticket.jsx";
import Poster from "../../components/common/Poster.jsx";
import Badge, {
  STATUS_TONE,
} from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import Modal, {
  ConfirmDialog,
} from "../../components/common/Modal.jsx";

import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../../components/common/States.jsx";

import {
  bookingService,
  bookingPhase,
  canCancel,
} from "../../services/bookingService.js";

import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useDocTitle } from "../../hooks/useDocTitle.js";

import { downloadTicket } from "../../utils/ticketFile.js";
import {
  formatDate,
  money,
  time12,
} from "../../utils/format.js";

const TABS = [
  ["upcoming", "Upcoming"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export default function MyBookingsPage() {
  useDocTitle("My bookings");

  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState("upcoming");
  const [view, setView] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => bookingService.list(),
    [user?.id]
  );

  const all = data || [];

  const stats = useMemo(() => {
    return {
      total: all.length,

      tickets: all.reduce(
        (sum, booking) => sum + booking.seats.length,
        0
      ),

      spent: all
        .filter(
          (booking) =>
            booking.status === "confirmed" ||
            booking.status === "pending"
        )
        .reduce(
          (sum, booking) => sum + booking.total,
          0
        ),
    };
  }, [all]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map(([key]) => [
          key,
          all.filter(
            (booking) => bookingPhase(booking) === key
          ).length,
        ])
      ),
    [all]
  );

  const rows = useMemo(
    () =>
      all
        .filter(
          (booking) => bookingPhase(booking) === tab
        )
        .sort((a, b) => {
          const aDate = `${a.date || ""}${a.start || ""}`;
          const bDate = `${b.date || ""}${b.start || ""}`;

          return tab === "upcoming"
            ? aDate.localeCompare(bDate)
            : bDate.localeCompare(aDate);
        }),
    [all, tab]
  );

  const doCancel = async () => {
    if (!cancel) return;

    setBusy(true);

    try {
      const result = await bookingService.cancel(cancel.id);

      toast.success(
        `Booking ${result.id} cancelled successfully.`
      );

      setCancel(null);
      setView(null);
      setTab("cancelled");

      await reload(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const messages = {
    upcoming: [
      "No upcoming bookings",
      "When you book a movie, your tickets will appear here.",
    ],

    completed: [
      "No completed bookings yet",
      "Movies you've watched will be listed here.",
    ],

    cancelled: [
      "No cancelled bookings",
      "Cancelled and refunded bookings appear here.",
    ],
  };

  const msg = messages[tab];

  return (
    <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-8">
      <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white">
        My Bookings
      </h1>

      <p className="mt-1 text-body-md text-on-surface-variant">
        View tickets, check showtimes and manage your reservations.
      </p>

      {data && (
        <dl className="mt-5 grid grid-cols-3 gap-3 max-w-xl">
          {[
            ["Bookings", stats.total],
            ["Tickets", stats.tickets],
            ["Spent", money(stats.spent)],
          ].map(([label, value]) => (
            <div key={label} className="panel p-3">
              <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                {label}
              </dt>

              <dd className="font-headline text-headline-sm font-bold text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div
        role="tablist"
        aria-label="Booking status"
        className="mt-6 flex gap-1 border-b border-white/10 overflow-x-auto no-scrollbar"
      >
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-label-md font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-primary-container text-white"
                : "border-transparent text-on-surface-variant hover:text-white"
            }`}
          >
            {label}

            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                tab === key
                  ? "bg-primary-container text-white"
                  : "bg-white/10"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4" role="tabpanel">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading && !data ? (
          [0, 1, 2].map((item) => (
            <Skeleton
              key={item}
              className="h-40 rounded-2xl"
            />
          ))
        ) : rows.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title={msg[0]}
            message={msg[1]}
            action={
              <Link to="/movies" className="btn-primary">
                Browse movies
              </Link>
            }
          />
        ) : (
          rows.map((booking) => (
            <Fragment key={booking.id}>
            <article
              key={booking.id}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
            >
              <Poster
                src={booking.poster}
                title={booking.movieTitle}
                className="w-24 shrink-0 hidden sm:block"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-headline text-headline-sm text-white">
                      {booking.movieTitle}
                    </h2>

                    <p className="text-label-sm text-secondary font-bold uppercase tracking-wider">
                      {booking.format}
                    </p>
                  </div>

                  <Badge
                    tone={STATUS_TONE[booking.status]}
                    dot
                  >
                    {booking.status === "refunded"
                      ? "Refunded"
                      : booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-body-sm">
                  <div>
                    <dt className="text-on-surface-variant flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden />
                      Date
                    </dt>

                    <dd className="text-white">
                      {booking.date
                        ? formatDate(booking.date, {
                            weekday: true,
                          })
                        : "Unavailable"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden />
                      Time
                    </dt>

                    <dd className="text-white">
                      {booking.start
                        ? time12(booking.start)
                        : "Unavailable"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-on-surface-variant flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" aria-hidden />
                      Cinema
                    </dt>

                    <dd className="text-white">
                      {booking.cinemaShort}
                      {" • "}
                      {booking.auditoriumName}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-on-surface-variant">
                      Seats • Total
                    </dt>

                    <dd className="text-white">
                      {booking.seats.length
                        ? booking.seats
                            .map((seat) => seat.id)
                            .join(", ")
                        : "Unavailable"}

                      {" • "}
                      <b>{money(booking.total)}</b>
                    </dd>
                  </div>
                </dl>

                <p className="mt-2 text-label-sm text-on-surface-variant">
                  Booking ID{" "}
                  <b className="text-white font-mono">
                    {booking.id}
                  </b>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setView(booking)}
                  >
                    View ticket
                  </Button>

                  {tab !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Download}
                      onClick={() => {
                        downloadTicket(booking);
                        toast.success("Ticket downloaded.");
                      }}
                    >
                      Download
                    </Button>
                  )}

                  {tab === "upcoming" && canCancel(booking) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="!text-error hover:!bg-error/10"
                      icon={XCircle}
                      onClick={() => setCancel(booking)}
                    >
                      Cancel booking
                    </Button>
                  )}
                </div>
              </div>
            </article>
            <Ticket booking={booking} className="hidden" />
            </Fragment>
          ))
        )}
      </div>

      <Modal
        open={!!view}
        onClose={() => setView(null)}
        size="xl"
        title="Your ticket"
        description={view && `Booking ${view.id}`}
        footer={
          view && (
            <>
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => downloadTicket(view)}
              >
                Download ticket
              </Button>

              <Button onClick={() => setView(null)}>
                Close
              </Button>
            </>
          )
        }
      >
        {view && <Ticket booking={view} />}
      </Modal>

      <ConfirmDialog
        open={!!cancel}
        onClose={() => setCancel(null)}
        onConfirm={doCancel}
        loading={busy}
        danger
        title="Cancel this booking?"
        confirmText="Cancel booking"
        cancelText="Keep booking"
        message={
          cancel &&
          `${cancel.movieTitle} on ${
            cancel.date
              ? formatDate(cancel.date)
              : "the scheduled date"
          } at ${
            cancel.start
              ? time12(cancel.start)
              : "the scheduled time"
          }. Your booking will be cancelled and its seats will be released. The current backend does not process refunds.`
        }
      />
    </div>
  );
}
