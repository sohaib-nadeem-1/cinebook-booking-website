
import { api, simulate } from "./api.js";
import { showtimeService } from "./showtimeService.js";
import { bookingService } from "./bookingService.js";
import { movieService } from "./movieService.js";

import { REVENUE_SERIES, NOTIFICATIONS } from "../data/dashboard.js";
import { store } from "../utils/storage.js";
import { todayKey } from "../utils/format.js";

// ================================
// AUDIT LOG
// ================================

export const logAudit = (actor, action) => {
  const list = store.get("audit", []);

  store.set(
    "audit",
    [
      {
        id: Date.now() + Math.random(),
        at: new Date().toISOString(),
        actor,
        action,
      },
      ...list,
    ].slice(0, 100)
  );
};

// ================================
// BOOKING STATUS
// ================================

const isLiveBooking = (booking) =>
  !["cancelled", "refunded"].includes(booking.status);

// ================================
// ADMIN SERVICE
// ================================

export const adminService = {
  // ================================
  // DASHBOARD
  // ================================

  dashboard: async () => {
    const today = todayKey();

    // Fetch actual data from backend APIs
    const [movies, shows, bookings] = await Promise.all([
      movieService.list({
        scope: "admin",
        sort: "title",
      }),

      showtimeService.list({
        date: today,
        includePast: true,
      }),

      bookingService.listAdmin(),
    ]);

    // Exclude cancelled and refunded bookings
    const paidBookings = bookings.filter(isLiveBooking);

    // Calculate admissions
    const admissions = paidBookings.reduce(
      (total, booking) => total + booking.seats.length,
      0
    );

    // Calculate total revenue
    const revenue = paidBookings.reduce(
      (total, booking) => total + booking.total,
      0
    );

    // Calculate average ticket revenue
    const avgSeat = admissions > 0
      ? revenue / admissions
      : 0;

    // Calculate halls near capacity
    const hallsAtCapacity = shows.filter(
      (showtime) =>
        Number(showtime.soldPct) >= 90
    ).length;

    // Return dashboard data
    return {
      kpis: {
        movies: movies.filter(
          (movie) => movie.status !== "archived"
        ).length,

        shows: shows.length,

        hallsAtCapacity,

        admissions,

        revenue,

        avgSeat,
      },

      screenings: shows,

      recent: [...bookings]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        )
        .slice(0, 8),
    };
  },

  // ================================
  // REVENUE
  // ================================

  revenue: (timeframe = "weekly") =>
    simulate(
      () => REVENUE_SERIES[timeframe] || REVENUE_SERIES.weekly,
      250
    ),

  // ================================
  // AUDIT LOG
  // ================================

  auditList: () => store.get("audit", []),

  // ================================
  // NOTIFICATIONS
  // ================================

  notifications: (kind) =>
    simulate(() => {
      const notifications = NOTIFICATIONS[kind] || [];
      const read = store.get(`notifRead:${kind}`, []);

      return notifications.map((notification) => ({
        ...notification,
        read: read.includes(notification.id),
      }));
    }, 100),

  // ================================
  // MARK NOTIFICATIONS AS READ
  // ================================

  markNotificationsRead: (kind) => {
    const notifications = NOTIFICATIONS[kind] || [];

    store.set(
      `notifRead:${kind}`,
      notifications.map((notification) => notification.id)
    );
  },
};
