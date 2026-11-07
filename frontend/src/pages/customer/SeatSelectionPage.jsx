import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronUp,
  Clock3,
  Eye,
  Film,
  Maximize2,
  MapPin,
  RotateCcw,
  Timer,
  ZoomIn,
  ZoomOut,
  Users,
  MonitorPlay,
} from "lucide-react";

import SeatMap, {
  SeatLegend,
} from "../../components/seats/SeatMap.jsx";

import BookingSummary from "../../components/booking/BookingSummary.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";

import {
  ErrorState,
  PageLoader,
} from "../../components/common/States.jsx";

import { seatService } from "../../services/seatService.js";
import { settingsService } from "../../services/settingsService.js";

import { useAsync } from "../../hooks/useAsync.js";
import { useBooking } from "../../context/BookingContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useDocTitle } from "../../hooks/useDocTitle.js";

import { calcPricing } from "../../utils/pricing.js";
import {
  duration,
  formatDate,
  money,
  time12,
} from "../../utils/format.js";

const MAX_SEATS = 8;

const fmtClock = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();

  const nav = useNavigate();
  const toast = useToast();

  const {
    hold,
    remaining,
    expired,
    toggleSeat,
    removeSeat,
    setCombo,
    clear,
    dismissExpired,
  } = useBooking();

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => seatService.getSeatMap(showtimeId),
    [showtimeId]
  );

  useDocTitle(
    data
      ? `Select seats • ${data.showtime.movie.title}`
      : "Select seats"
  );

  const [zoom, setZoom] = useState(1);
  const [sheet, setSheet] = useState(false);
  const [checking, setChecking] = useState(false);

  const warned = useRef({});

  const mine = hold.showtimeId === showtimeId;

  const chosen = useMemo(
    () => (mine ? hold.seats : []),
    [mine, hold.seats]
  );

  const selectedIds = useMemo(
    () => new Set(chosen.map((seat) => seat.id)),
    [chosen]
  );

  const settings = settingsService.pricing();

  const pricing = useMemo(
    () =>
      data
        ? calcPricing(
            chosen,
            data.showtime.price,
            {
              taxRate: settings.cinema.taxRate,
              serviceFee: settings.system.serviceFee,
            },
            {
              combo: mine && hold.combo,
            }
          )
        : null,
    [
      data,
      chosen,
      settings.cinema.taxRate,
      settings.system.serviceFee,
      mine,
      hold.combo,
    ]
  );

  const full = useMemo(
    () =>
      (data?.seats || []).reduce(
        (result, seat) => ({
          ...result,
          [seat.id]: seat,
        }),
        {}
      ),
    [data]
  );

  useEffect(() => {
    if (
      hold.showtimeId &&
      hold.showtimeId !== showtimeId &&
      hold.seats.length
    ) {
      toast.info(
        "Your previous seat selection was cleared for this showtime."
      );
    }
    // Initial mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      mine &&
      remaining === 120 &&
      !warned.current[hold.expiresAt]
    ) {
      warned.current[hold.expiresAt] = true;

      toast.info("Your seat hold expires in 2 minutes.");
    }
  }, [remaining, mine, hold.expiresAt, toast]);

  useEffect(() => {
    if (expired === showtimeId) {
      reload(true);
    }
  }, [expired, showtimeId, reload]);

  const onToggle = useCallback(
    (seat) => {
      const isSelected = selectedIds.has(seat.id);

      if (!isSelected && chosen.length >= MAX_SEATS) {
        return toast.warning(
          `You can book up to ${MAX_SEATS} seats at a time.`
        );
      }

      if (!isSelected && !mine && !chosen.length) {
        toast.info(
          `Seats are held for ${settings.system.holdMinutes} minutes while you check out.`,
          { duration: 3200 }
        );
      }

      toggleSeat(
        showtimeId,
        full[seat.id] || seat
      );

      dismissExpired();
    },
    [
      selectedIds,
      chosen.length,
      mine,
      toggleSeat,
      showtimeId,
      full,
      toast,
      dismissExpired,
      settings.system.holdMinutes,
    ]
  );

  const onBlocked = useCallback(
    (seat) => {
      toast.warning(
        `Seat ${seat.id} is no longer available.`
      );
    },
    [toast]
  );

  const proceed = async () => {
    if (!chosen.length) {
      return toast.warning(
        "Select at least one seat to continue."
      );
    }

    setChecking(true);

    try {
      // Send actual PostgreSQL IDs, not display labels.
      const selectedDbIds = chosen.map(
        (seat) => Number(seat.dbId)
      );

      const result = await seatService.verify(
        showtimeId,
        selectedDbIds
      );

      if (!result.ok) {
        const takenDisplayIds = result.taken.map((dbId) => {
          const seat = chosen.find(
            (item) => Number(item.dbId) === Number(dbId)
          );

          return seat?.id || dbId;
        });

        result.taken.forEach((dbId) => {
          const seat = chosen.find(
            (item) => Number(item.dbId) === Number(dbId)
          );

          if (seat) removeSeat(seat.id);
        });

        toast.error(
          `Seat ${takenDisplayIds.join(", ")} was just taken. Please choose another.`
        );

        await reload(true);
        return;
      }

      nav("/checkout");
    } catch (err) {
      toast.error(
        err.message || "Unable to verify seat availability."
      );
    } finally {
      setChecking(false);
    }
  };

  if (loading && !data) {
    return <PageLoader label="Loading seat map…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Seat map unavailable"
        message={error.message}
        onRetry={
          error.code === "NOT_FOUND"
            ? () => nav("/movies")
            : reload
        }
      />
    );
  }

  if (!data) return null;

  const { showtime, layout, seats, prices } = data;

  const m = showtime.movie;

  const soldOut = seats.every(
    (seat) => seat.status !== "available"
  );

  const urgent =
    mine && remaining > 0 && remaining <= 120;

  return (
    <div className="pb-28 lg:pb-12">
      <div className="border-b border-white/5 bg-surface/70 backdrop-blur md:sticky top-16 md:top-20 z-30">
        <div className="max-w-[1600px] mx-auto px-margin-mobile md:px-margin py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/movies/${m.slug}#showtimes`}
              aria-label="Back to showtimes"
              className="w-10 h-10 rounded-full bg-surface-container-high grid place-items-center hover:bg-surface-container-highest shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="font-headline text-headline-sm font-bold text-white truncate">
                  {m.title}
                </h1>

                <span className="rounded bg-primary-container px-2 py-0.5 text-label-sm font-bold text-white">
                  {showtime.format} LASER
                </span>

                <span className="text-label-sm text-on-surface-variant">
                  {m.rating} • {duration(m.runtime)}
                </span>
              </div>

              <p className="flex flex-wrap items-center gap-x-3 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  {showtime.cinema?.name} —{" "}
                  {showtime.auditorium?.name}
                </span>

                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-secondary" />
                  {formatDate(showtime.date, {
                    weekday: true,
                  })}{" "}
                  • {time12(showtime.start)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              role="timer"
              aria-live="off"
              aria-label={
                mine
                  ? `Seat hold time remaining ${fmtClock(remaining)}`
                  : "Seat hold not started"
              }
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-label-md ${
                urgent
                  ? "border-error/60 bg-error-container/30 text-error"
                  : "border-white/10 bg-surface-container-low text-on-surface"
              }`}
            >
              <Timer className="w-4 h-4 text-secondary" />

              {mine ? (
                <>
                  Holding seats:{" "}
                  <b className="tabular-nums" data-testid="hold-timer">
                    {fmtClock(remaining)}
                  </b>
                </>
              ) : (
                <span className="text-on-surface-variant">
                  Hold starts when you pick a seat
                </span>
              )}
            </div>

            <button
              aria-label="Zoom out"
              disabled={zoom <= 0.7}
              onClick={() =>
                setZoom((value) =>
                  Math.max(0.7, +(value - 0.15).toFixed(2))
                )
              }
              className="hidden sm:grid w-10 h-10 rounded-full bg-surface-container-high place-items-center hover:bg-surface-container-highest disabled:opacity-40"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              aria-label="Zoom in"
              disabled={zoom >= 1.3}
              onClick={() =>
                setZoom((value) =>
                  Math.min(1.3, +(value + 0.15).toFixed(2))
                )
              }
              className="hidden sm:grid w-10 h-10 rounded-full bg-surface-container-high place-items-center hover:bg-surface-container-highest disabled:opacity-40"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              aria-label="Reset zoom"
              onClick={() => setZoom(1)}
              className="hidden sm:grid w-10 h-10 rounded-full bg-surface-container-high place-items-center hover:bg-surface-container-highest"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-margin-mobile md:px-margin mt-6 grid gap-gutter lg:grid-cols-[1fr_400px] items-start">
        <section
          className="card p-3 sm:p-6 relative overflow-hidden"
          aria-labelledby="map-title"
        >
          <h2 id="map-title" className="sr-only">
            Seat map
          </h2>

          {expired === showtimeId && (
            <div
              role="alert"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/40 bg-secondary-container/15 px-4 py-3 text-body-sm text-secondary"
            >
              <span className="flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                Your {settings.system.holdMinutes}-minute hold expired.
                Pick your seats again to continue.
              </span>

              <button
                onClick={dismissExpired}
                className="underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {soldOut && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-error/40 bg-error-container/20 px-4 py-3 text-body-sm text-on-error-container"
            >
              This showtime is sold out.{" "}
              <Link
                className="underline"
                to={`/movies/${m.slug}#showtimes`}
              >
                Choose another showtime
              </Link>
              .
            </div>
          )}

          <div className="mb-5">
            <SeatLegend vipPrice={prices.vip} />
          </div>

          <p className="sm:hidden mb-2 text-center text-label-sm text-on-surface-variant">
            Swipe sideways to see every seat in the row.
          </p>

          <SeatMap
            layout={layout}
            seats={seats}
            prices={prices}
            selectedIds={selectedIds}
            onToggle={onToggle}
            onBlocked={onBlocked}
            zoom={zoom}
            screenLabel={`THEATER SCREEN (CURVED ${
              showtime.format.includes("IMAX")
                ? "IMAX 70MM"
                : "LASER 4K"
            })`}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/70 border border-white/5 px-4 py-3 text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-secondary" />
              Dolby Atmos 64-Channel Spatial Acoustics Tuned
            </span>

            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-secondary" />
              Optimum viewing angle: Rows D through G
            </span>
          </div>
        </section>

        <aside
          className="hidden lg:block lg:sticky lg:top-44 space-y-4"
          aria-label="Booking summary"
        >
          <div className="card p-5">
            <BookingSummary
              showtime={showtime}
              seats={chosen}
              pricing={pricing}
              onRemoveSeat={removeSeat}
              combo={mine && hold.combo}
              onCombo={setCombo}
            >
              <div className="space-y-2">
                <Button
                  className="w-full !py-3.5 !text-body-md uppercase tracking-wide"
                  onClick={proceed}
                  disabled={!chosen.length}
                  loading={checking}
                  loadingText="Checking seats…"
                  iconRight={ArrowRight}
                >
                  Proceed to checkout
                </Button>

                {chosen.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    icon={RotateCcw}
                    onClick={() => {
                      clear();
                      toast.info("Selection cleared.");
                    }}
                  >
                    Clear selection
                  </Button>
                )}
              </div>
            </BookingSummary>
          </div>

          <div className="card p-4 flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-surface-container-high grid place-items-center">
              <Film className="w-5 h-5 text-secondary" />
            </span>

            <div>
              <p className="font-headline text-title-md text-white">
                Dual Laser 4K Projection
              </p>
              <p className="text-body-sm text-on-surface-variant">
                Aspect ratio 1.43:1 full ceiling-to-floor expansion.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile / tablet checkout summary */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSheet(true)}
            className="flex-1 text-left min-w-0"
            aria-label="View booking summary"
          >
            <p className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
              <Users className="w-3.5 h-3.5" />

              {chosen.length} seat{chosen.length === 1 ? "" : "s"}

              {chosen.length > 0 && (
                <>
                  {" "}
                  •{" "}
                  <span className="truncate">
                    {chosen.map((seat) => seat.id).join(", ")}
                  </span>
                </>
              )}

              <ChevronUp className="w-4 h-4 ml-auto" />
            </p>

            <p className="font-headline text-headline-sm font-bold text-white tabular-nums">
              {money(pricing.total)}
            </p>
          </button>

          <Button
            className="shrink-0 !px-5"
            onClick={proceed}
            disabled={!chosen.length}
            loading={checking}
            loadingText="Checking…"
            iconRight={ArrowRight}
          >
            Checkout
          </Button>
        </div>
      </div>

      <Modal
        open={sheet}
        onClose={() => setSheet(false)}
        title="Booking summary"
        size="md"
      >
        <BookingSummary
          showtime={showtime}
          seats={chosen}
          pricing={pricing}
          onRemoveSeat={removeSeat}
          combo={mine && hold.combo}
          onCombo={setCombo}
        />

        <Button
          className="w-full mt-4 !py-3.5"
          onClick={() => {
            setSheet(false);
            proceed();
          }}
          disabled={!chosen.length}
          iconRight={ArrowRight}
        >
          Proceed to checkout
        </Button>
      </Modal>
    </div>
  );
}