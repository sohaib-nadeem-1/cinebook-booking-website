
import { api, ApiError } from "./api.js";
import { showtimeService } from "./showtimeService.js";

import { getLayout, tierPrices } from "../data/seats.js";
import { profileFor } from "./availability.js";

const API_ENDPOINT = "/seats";

const fetchSeatAvailability = async (showtimeId) => {
  const response = await api.get(
    `${API_ENDPOINT}/showtime/${showtimeId}`
  );

  if (!Array.isArray(response?.seats)) {
    throw new ApiError(
      "Invalid seat availability response.",
      "INVALID_RESPONSE"
    );
  }

  return response.seats;
};

const mapSeat = (seat, showtime, prices) => {
  const category = seat.seat_category || seat.category;

  const tier =
    category === "vip lounge" ? "vip" : category;

  const price = Number(prices[tier]);

  return {
    ...seat,

    // Display ID: E1, E2, A1...
    id: String(seat.id),

    // Actual PostgreSQL seat ID
    dbId: Number(seat.dbId),
    seatId: Number(seat.dbId),

    row: seat.row,
    number: Number(seat.number),

    category,
    type: tier,
    tier,

    price: Number.isFinite(price) ? price : 0,

    // Keep backend availability status.
    // VIP seats are selectable when available.
    status: seat.status,
  };
};

export const seatService = {
  getSeatMap: async (showtimeId) => {
    const id = Number(showtimeId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(
        "Invalid showtime ID.",
        "VALIDATION",
        400
      );
    }

    const [showtime, rawSeats] = await Promise.all([
      showtimeService.get(id),
      fetchSeatAvailability(id),
    ]);

    if (!showtime) {
      throw new ApiError(
        "Showtime not found.",
        "NOT_FOUND",
        404
      );
    }

    const profile = profileFor(showtime.auditoriumId);

    const prices = {
      ...tierPrices(showtime.price),
      standard: Number(showtime.standardPrice),
      prime: Number(showtime.primePrice),
    };

    const formattedSeats = rawSeats.map((seat) =>
      mapSeat(seat, showtime, prices)
    );

    return {
      showtime,
      layout: getLayout(profile),
      seats: formattedSeats,
      prices,
    };
  },

  verify: async (showtimeId, selectedSeatIds) => {
    if (!Array.isArray(selectedSeatIds)) {
      throw new ApiError(
        "Selected seats must be an array.",
        "VALIDATION",
        400
      );
    }

    const rawSeats = await fetchSeatAvailability(showtimeId);

    const seatMap = new Map(
      rawSeats.map((seat) => [
        Number(seat.dbId),
        seat,
      ])
    );

    const taken = selectedSeatIds.filter((seatId) => {
      const seat = seatMap.get(Number(seatId));

      return !seat || seat.status !== "available";
    });

    return {
      ok: taken.length === 0,
      taken,
    };
  },
};
