import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/index.js";

import { showtimes } from "../db/schema/showTime.schema.js";
import { seats } from "../db/schema/seats.schema.js";
import { booking } from "../db/schema/bookings.schema.js";
import { booking_seats } from "../db/schema/booking_seats.schema.js";

export const getShowtimeSeats = async (req, res) => {
  try {
    const showtimeId = Number(req.params.showtimeId);

    if (!Number.isInteger(showtimeId) || showtimeId <= 0) {
      return res.status(400).json({
        message: "Invalid showtime ID",
      });
    }

    // 1. Find showtime
    const [showtime] = await db
      .select()
      .from(showtimes)
      .where(eq(showtimes.id, showtimeId));

    if (!showtime) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    // 2. Get all seats belonging to this show's auditorium
    const auditoriumSeats = await db
      .select()
      .from(seats)
      .where(eq(seats.auditorium_id, showtime.auditorium_id))
      .orderBy(asc(seats.seat_number));

    // 3. Get seats already booked for this showtime
    const bookedSeats = await db
      .select({
        seat_id: booking_seats.seat_id,
      })
      .from(booking_seats)
      .innerJoin(
        booking,
        eq(booking_seats.booking_id, booking.id)
      )
      .where(
        and(
          eq(booking.showtime_id, showtimeId),
          eq(booking.status, "confirmed")
        )
      );

    const bookedSeatIds = new Set(
      bookedSeats.map((seat) => Number(seat.seat_id))
    );

    // 4. Build frontend-friendly seat objects
    const formattedSeats = auditoriumSeats.map((seat) => {
      const seatNumber = String(seat.seat_number);

      const row = seatNumber.match(/^[A-Za-z]+/)?.[0] || "";
      const number = Number(
        seatNumber.match(/\d+$/)?.[0] || 0
      );

      return {
        dbId: Number(seat.id),
        seatId: Number(seat.id),

        // Display ID used by the existing seat map
        id: seatNumber,

        row,
        number,

        category: seat.seat_category,
        seat_category: seat.seat_category,

        status: bookedSeatIds.has(Number(seat.id))
          ? "occupied"
          : "available",
      };
    });

    return res.status(200).json({
      message: "Seat availability fetched successfully",
      showtimeId,
      auditoriumId: showtime.auditorium_id,
      totalSeats: formattedSeats.length,
      availableSeats: formattedSeats.filter(
        (seat) => seat.status === "available"
      ).length,
      bookedSeats: formattedSeats.filter(
        (seat) => seat.status === "booked"
      ).length,
      seats: formattedSeats,
    });
  } catch (error) {
    console.error("Get Showtime Seats Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};