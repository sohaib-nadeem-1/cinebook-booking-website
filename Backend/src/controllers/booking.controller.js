import { and, eq, inArray, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import config from "../config/config.data.js";
import { db } from "../db/index.js";
import { showtimes } from "../db/schema/showTime.schema.js";
import { movies } from "../db/schema/movies.schema.js";
import { auditoriums } from "../db/schema/auditorium.schema.js";
import { cinemas } from "../db/schema/cinemas.schema.js";
import { user } from "../db/schema/user.schema.js";
import { seats } from "../db/schema/seats.schema.js";
import { booking } from "../db/schema/bookings.schema.js";
import { booking_seats } from "../db/schema/booking_seats.schema.js";

const fail = (statusCode, message, extra = {}) =>
  Object.assign(new Error(message), { statusCode, extra });

const positiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const vipPrice = (primePrice) =>
  (Math.round(Number(primePrice) * 1.25 * 2) / 2).toFixed(2);

async function loadBookingDetails(bookingId) {
  const [row] = await db
    .select({
      booking,
      movie: movies,
      showtime: showtimes,
      auditorium: auditoriums,
      cinema: cinemas,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
    .from(booking)
    .innerJoin(showtimes, eq(booking.showtime_id, showtimes.id))
    .innerJoin(movies, eq(showtimes.movie_id, movies.id))
    .innerJoin(auditoriums, eq(showtimes.auditorium_id, auditoriums.id))
    .innerJoin(cinemas, eq(auditoriums.cinema_id, cinemas.id))
    .innerJoin(user, eq(booking.user_id, user.id))
    .where(eq(booking.id, bookingId));

  if (!row) return null;

  const seatRows = await db
    .select({
      id: seats.id,
      seat_number: seats.seat_number,
      seat_category: seats.seat_category,
      price: booking_seats.price,
    })
    .from(booking_seats)
    .innerJoin(seats, eq(booking_seats.seat_id, seats.id))
    .where(eq(booking_seats.booking_id, bookingId));

  return {
    ...row.booking,
    movie: row.movie,
    movieTitle: row.movie.title,
    poster: row.movie.poster_url || "",
    showtime: row.showtime,
    date: row.showtime.date,
    start: row.showtime.start_time,
    start_time: row.showtime.start_time,
    format: row.showtime.format,
    auditorium: row.auditorium,
    auditoriumName: `Hall ${row.auditorium.hall_no}`,
    cinema: row.cinema,
    cinemaName: row.cinema.name,
    cinemaShort: row.cinema.name,
    city: row.cinema.city,
    address: row.cinema.address,
    customer: row.customer,
    seats: seatRows.map((seat) => ({
      dbId: seat.id,
      seatId: seat.id,
      id: seat.seat_number,
      seat_number: seat.seat_number,
      category: seat.seat_category,
      seat_category: seat.seat_category,
      tier: seat.seat_category === "vip lounge" ? "vip" : seat.seat_category,
      price: Number(seat.price),
    })),
    total: Number(row.booking.total_amount),
    ticketToken: jwt.sign(
      { bookingId, purpose: "cinebook-ticket" },
      config.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    ),
  };
}

async function listBookings(whereClause) {
  let query = db.select({ id: booking.id }).from(booking);
  if (whereClause) query = query.where(whereClause);
  const rows = await query.orderBy(desc(booking.created_at));
  return Promise.all(rows.map(({ id }) => loadBookingDetails(id)));
}

async function cancelById(bookingId, ownerId = null) {
  return db.transaction(async (tx) => {
    const conditions = [eq(booking.id, bookingId)];
    if (ownerId !== null) conditions.push(eq(booking.user_id, ownerId));

    const [current] = await tx
      .select()
      .from(booking)
      .where(and(...conditions))
      .for("update");

    if (!current) throw fail(404, "Booking not found");
    if (current.status === "cancelled") throw fail(409, "Booking is already cancelled");
    if (current.status === "refunded") throw fail(409, "Refunded booking cannot be cancelled");

    const [show] = await tx
      .select()
      .from(showtimes)
      .where(eq(showtimes.id, current.showtime_id));

    if (show) {
      const showStart = new Date(`${show.date}T${show.start_time}+05:00`);
      if (!Number.isNaN(showStart.getTime()) && showStart <= new Date()) {
        throw fail(400, "A booking cannot be cancelled after the show has started");
      }
    }

    const [updated] = await tx
      .update(booking)
      .set({ status: "cancelled", updated_at: new Date() })
      .where(eq(booking.id, bookingId))
      .returning();

    return updated;
  });
}

export const createBookings = async (req, res) => {
  try {
    const showtimeId = positiveId(req.body?.showtimeId);
    const userid = positiveId(req.user?.userid);
    const rawSeatIds = req.body?.seatsID;

    if (!showtimeId || !userid || !Array.isArray(rawSeatIds) ||
        rawSeatIds.length === 0 || rawSeatIds.length > 10) {
      return res.status(400).json({
        message: "A valid showtime ID and between 1 and 10 seats are required",
      });
    }

    const seatIds = rawSeatIds.map(positiveId);
    if (seatIds.some((id) => !id)) {
      return res.status(400).json({ message: "All seat IDs must be positive integers" });
    }
    if (new Set(seatIds).size !== seatIds.length) {
      return res.status(400).json({ message: "Duplicate seats are not allowed" });
    }

    const created = await db.transaction(async (tx) => {
      // Every booking for a showtime locks the same row, serializing seat allocation.
      const [show] = await tx.select().from(showtimes)
        .where(eq(showtimes.id, showtimeId)).for("update");
      if (!show) throw fail(404, "Showtime not found");

      const selected = await tx.select().from(seats)
        .where(inArray(seats.id, seatIds));
      if (selected.length !== seatIds.length) throw fail(404, "One or more selected seats were not found");
      if (selected.some((seat) => seat.auditorium_id !== show.auditorium_id)) {
        throw fail(400, "Selected seat does not belong to this auditorium");
      }

      const conflicts = await tx.select({ seat_id: booking_seats.seat_id })
        .from(booking_seats)
        .innerJoin(booking, eq(booking_seats.booking_id, booking.id))
        .where(and(
          eq(booking.showtime_id, showtimeId),
          inArray(booking_seats.seat_id, seatIds),
          eq(booking.status, "confirmed"),
        ));

      if (conflicts.length) {
        throw fail(409, "Some selected seats are already booked", {
          bookedSeats: conflicts.map((item) => item.seat_id),
        });
      }

      const pricedSeats = selected.map((seat) => {
        let amount;
        if (seat.seat_category === "standard") amount = Number(show.standard_price);
        else if (seat.seat_category === "prime") amount = Number(show.prime_price);
        else if (seat.seat_category === "vip lounge") amount = Number(vipPrice(show.prime_price));
        else throw fail(400, `Unsupported seat category: ${seat.seat_category}`);

        if (!Number.isFinite(amount) || amount < 0) throw fail(400, "Invalid price configured for this showtime");
        return { seat_id: seat.id, price: amount.toFixed(2) };
      });

      const totalCents = pricedSeats.reduce((sum, seat) => sum + Math.round(Number(seat.price) * 100), 0);
      const totalAmount = (totalCents / 100).toFixed(2);
      const [newBooking] = await tx.insert(booking).values({
        user_id: userid,
        showtime_id: showtimeId,
        total_amount: totalAmount,
        status: "confirmed",
        updated_at: new Date(),
      }).returning();

      await tx.insert(booking_seats).values(pricedSeats.map((seat) => ({
        booking_id: newBooking.id,
        seat_id: seat.seat_id,
        price: seat.price,
      })));

      return { booking: newBooking, seats: pricedSeats, totalAmount };
    });

    const details = await loadBookingDetails(created.booking.id);
    return res.status(201).json({
      message: "Booking created successfully",
      booking: details,
      seats: details.seats,
      totalAmount: created.totalAmount,
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, ...error.extra });
    if (error.code === "23505") return res.status(409).json({ message: "A selected seat conflicts with an existing booking" });
    console.error("Create Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userid = positiveId(req.user?.userid);
    if (!userid) return res.status(401).json({ message: "Invalid authenticated user" });
    const bookings = await listBookings(eq(booking.user_id, userid));
    return res.status(200).json({ message: "Bookings fetched successfully", bookings });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleBooking = async (req, res) => {
  try {
    const bookingId = positiveId(req.params.id);
    const userid = positiveId(req.user?.userid);
    if (!bookingId) return res.status(400).json({ message: "Invalid booking ID" });
    const details = await loadBookingDetails(bookingId);
    if (!details || details.user_id !== userid) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ message: "Booking fetched successfully", booking: details, seats: details.seats });
  } catch (error) {
    console.error("Get Single Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = positiveId(req.params.id);
    const userid = positiveId(req.user?.userid);
    if (!bookingId) return res.status(400).json({ message: "Invalid booking ID" });
    const cancelled = await cancelById(bookingId, userid);
    return res.status(200).json({ message: "Booking cancelled successfully", booking: cancelled });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await listBookings(undefined);
    return res.status(200).json({ message: "All bookings fetched successfully", bookings });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBookingByIdAdmin = async (req, res) => {
  try {
    const bookingId = positiveId(req.params.id);
    if (!bookingId) return res.status(400).json({ message: "Invalid booking ID" });
    const details = await loadBookingDetails(bookingId);
    if (!details) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ message: "Booking fetched successfully", booking: details, seats: details.seats });
  } catch (error) {
    console.error("Admin Get Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminCancelBooking = async (req, res) => {
  try {
    const bookingId = positiveId(req.params.id);
    if (!bookingId) return res.status(400).json({ message: "Invalid booking ID" });
    const cancelled = await cancelById(bookingId);
    return res.status(200).json({ message: "Booking cancelled successfully", booking: cancelled });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    console.error("Admin Cancel Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const verifyTicket = async (req, res) => {
  try {
    const token = req.params.token;
    const payload = jwt.verify(token, config.JWT_SECRET_KEY);
    if (payload.purpose !== "cinebook-ticket" || !positiveId(payload.bookingId)) {
      return res.status(400).json({ valid: false, message: "Invalid ticket QR" });
    }
    const details = await loadBookingDetails(Number(payload.bookingId));
    if (!details || details.status !== "confirmed") {
      return res.status(404).json({ valid: false, message: "Ticket is not valid" });
    }
    return res.status(200).json({
      valid: true,
      booking: {
        id: details.id,
        movieTitle: details.movieTitle,
        date: details.date,
        start: details.start,
        cinemaName: details.cinemaName,
        auditoriumName: details.auditoriumName,
        seats: details.seats.map((seat) => seat.id),
      },
    });
  } catch {
    return res.status(400).json({ valid: false, message: "Invalid or expired ticket QR" });
  }
};
