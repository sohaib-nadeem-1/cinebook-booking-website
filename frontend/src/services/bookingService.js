import { api, ApiError } from "./api.js";
const API_ENDPOINT = "/bookings";
const getArray = (response, key) => Array.isArray(response?.[key]) ? response[key] : [];
const getOne = (response, key) => Array.isArray(response?.[key]) ? response[key][0] || null : response?.[key] || null;

const normalizeBooking = (booking) => {
  const movie = booking.movie || {};
  const cinema = booking.cinema || {};
  const auditorium = booking.auditorium || {};
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const total = Number(booking.total ?? booking.total_amount ?? 0);
  return {
    ...booking, id: Number(booking.id), movie,
    movieTitle: booking.movieTitle || movie.title || "Movie details unavailable",
    poster: booking.poster || movie.poster_url || "",
    cinema, cinemaName: booking.cinemaName || cinema.name || "Cinema details unavailable",
    cinemaShort: booking.cinemaShort || cinema.name || "Cinema details unavailable",
    city: booking.city || cinema.city || "", address: booking.address || cinema.address || "",
    auditorium, auditoriumName: booking.auditoriumName || (auditorium.hall_no ? `Hall ${auditorium.hall_no}` : "Auditorium unavailable"),
    date: booking.date ? String(booking.date).slice(0, 10) : null,
    start: booking.start || booking.start_time || booking.showtime?.start_time || null,
    start_time: booking.start || booking.start_time || booking.showtime?.start_time || null,
    format: booking.format || booking.showtime?.format || "Movie",
    seats: seats.map((seat) => ({
      ...seat, id: seat.id || seat.seat_number || String(seat.dbId || seat.seat_id || ""),
      dbId: Number(seat.dbId ?? seat.seat_id ?? seat.id),
      seatId: Number(seat.seatId ?? seat.dbId ?? seat.seat_id ?? seat.id),
      tier: seat.tier || (seat.seat_category === "vip lounge" ? "vip" : seat.seat_category) || "standard",
      price: Number(seat.price || 0),
    })),
    customer: booking.customer || { name: "Customer", email: "" },
    total, total_amount: total,
  };
};
const bookingDateTime = (item) => {
  if (!item?.date || !item?.start) return null;
  const value = new Date(`${String(item.date).slice(0, 10)}T${item.start}`);
  return Number.isNaN(value.getTime()) ? null : value;
};
export const hoursUntil = (date, time) => {
  if (!date || !time) return null;
  const target = new Date(`${date}T${time}`);
  return Number.isNaN(target.getTime()) ? null : (target.getTime() - Date.now()) / 3600000;
};
export const bookingPhase = (item) => {
  if (["cancelled", "refunded"].includes(item.status)) return "cancelled";
  const target = bookingDateTime(item);
  return target && target <= new Date() ? "completed" : "upcoming";
};
export const canCancel = (item) => {
  const target = bookingDateTime(item);
  return item.status === "confirmed" && target !== null && target > new Date();
};
export const canRefund = (item) => {
  const target = bookingDateTime(item);
  return canCancel(item) && (target.getTime() - Date.now()) / 3600000 >= 2;
};
async function fetchList(path) {
  const response = await api.get(path);
  return getArray(response, "bookings").map(normalizeBooking);
}
export const bookingService = {
  list: () => fetchList(`${API_ENDPOINT}/my-bookings`),
  listAdmin: () => fetchList(`${API_ENDPOINT}/admin/all`),
  get: async (id, { admin = false } = {}) => {
    const response = await api.get(admin ? `${API_ENDPOINT}/admin/${id}` : `${API_ENDPOINT}/${id}`);
    const booking = getOne(response, "booking");
    return booking ? normalizeBooking(booking) : null;
  },
  create: async ({ showtimeId, seats }) => {
    if (!Array.isArray(seats)) throw new ApiError("Seats must be an array.", "VALIDATION", 400);
    const seatsID = seats.map((seat) => Number(seat.dbId ?? seat.seatId ?? seat.id));
    if (!Number.isInteger(Number(showtimeId)) || Number(showtimeId) <= 0 || !seatsID.length ||
        seatsID.some((id) => !Number.isSafeInteger(id) || id <= 0) || new Set(seatsID).size !== seatsID.length) {
      throw new ApiError("Invalid showtime or seat selection.", "VALIDATION", 400);
    }
    try {
      const response = await api.post(`${API_ENDPOINT}/`, { showtimeId: Number(showtimeId), seatsID });
      if (!response?.booking?.id) throw new ApiError("Invalid booking response from server.", "INVALID_RESPONSE");
      return normalizeBooking(response.booking);
    } catch (error) {
      if (error.status === 409) throw new ApiError(error.message || "One or more seats are already booked.", "SEAT_TAKEN", 409);
      throw error;
    }
  },
  cancel: async (id, { by = "customer" } = {}) => {
    const path = by === "admin" ? `${API_ENDPOINT}/admin/${id}/cancel` : `${API_ENDPOINT}/${id}/cancel`;
    const response = await api.patch(path);
    const cancelled = getOne(response, "booking");
    if (!cancelled) throw new ApiError("Invalid cancellation response.", "INVALID_RESPONSE");
    return normalizeBooking(cancelled);
  },
  stats: async () => {
    const bookings = await bookingService.list();
    return {
      total: bookings.length,
      tickets: bookings.reduce((sum, item) => sum + item.seats.length, 0),
      spent: bookings.filter((item) => ["confirmed", "pending"].includes(item.status)).reduce((sum, item) => sum + item.total, 0),
    };
  },
};
