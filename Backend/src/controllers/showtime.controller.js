
import { and, eq, gt, lt, getTableColumns } from "drizzle-orm";

import { db } from "../db/index.js";
import { auditoriums } from "../db/schema/auditorium.schema.js";
import { cinemas } from "../db/schema/cinemas.schema.js";
import { movies } from "../db/schema/movies.schema.js";
import { showtimes } from "../db/schema/showTime.schema.js";

// Reusable query for showtime details with auditorium and cinema
const getShowtimesWithDetails = () => {
  return db
    .select({
      ...getTableColumns(showtimes),

      auditorium: {
        id: auditoriums.id,
        cinema_id: auditoriums.cinema_id,
        hall_no: auditoriums.hall_no,
      },

      cinema: {
        id: cinemas.id,
        name: cinemas.name,
        city: cinemas.city,
        address: cinemas.address,
        phone: cinemas.phone,
      },
    })
    .from(showtimes)
    .leftJoin(
      auditoriums,
      eq(showtimes.auditorium_id, auditoriums.id)
    )
    .leftJoin(
      cinemas,
      eq(auditoriums.cinema_id, cinemas.id)
    );
};

// CREATE SHOWTIME

export const createShowtime = async (req, res) => {
  try {
    const {
      movie_id,
      auditorium_id,
      format,
      date,
      start_time,
      end_time,
      standard_price,
      prime_price,
    } = req.body;

    if (
      !movie_id ||
      !auditorium_id ||
      !format ||
      !date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    if (
      standard_price === undefined ||
      prime_price === undefined ||
      Number(standard_price) <= 0 ||
      Number(prime_price) <= 0 ||
      !Number.isFinite(Number(standard_price)) ||
      !Number.isFinite(Number(prime_price))
    ) {
      return res.status(400).json({
        message: "Valid ticket prices are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message: "End time must be greater than start time",
      });
    }

    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, Number(movie_id)));

    if (movie.length === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const auditorium = await db
      .select()
      .from(auditoriums)
      .where(eq(auditoriums.id, Number(auditorium_id)));

    if (auditorium.length === 0) {
      return res.status(404).json({
        message: "Auditorium not found",
      });
    }

    const conflictingShowtimes = await db
      .select()
      .from(showtimes)
      .where(
        and(
          eq(showtimes.auditorium_id, Number(auditorium_id)),
          eq(showtimes.date, date),
          lt(showtimes.start_time, end_time),
          gt(showtimes.end_time, start_time)
        )
      );

    if (conflictingShowtimes.length > 0) {
      return res.status(409).json({
        message: "Showtime conflict: Auditorium is already occupied",
      });
    }

    const insertingShowtime = await db
      .insert(showtimes)
      .values({
        movie_id: Number(movie_id),
        auditorium_id: Number(auditorium_id),
        format,
        date,
        start_time,
        end_time,
        standard_price,
        prime_price,
      })
      .returning();

    return res.status(201).json({
      message: "Showtime created successfully",
      insertingShowtime,
    });

  } catch (error) {
    console.error("Create Showtime Error:", error);

    return res.status(500).json({
      message: "Failed to create showtime",
    });
  }
};

// GET ALL SHOWTIMES WITH AUDITORIUM AND CINEMA

export const getAllShowtimes = async (req, res) => {
  try {
    const allShowtimes = await getShowtimesWithDetails();

    return res.status(200).json({
      message: "All showtimes fetched successfully",
      allShowtimes,
    });

  } catch (error) {
    console.error("Get All Showtimes Error:", error);

    return res.status(500).json({
      message: "Failed to fetch showtimes",
    });
  }
};

// GET SINGLE SHOWTIME WITH AUDITORIUM AND CINEMA

export const getSingleShowtime = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Valid Showtime ID is required",
      });
    }

    const showtime = await getShowtimesWithDetails()
      .where(eq(showtimes.id, id));

    if (showtime.length === 0) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    return res.status(200).json({
      message: "Showtime fetched successfully",
      showtime,
    });

  } catch (error) {
    console.error("Get Single Showtime Error:", error);

    return res.status(500).json({
      message: "Failed to fetch showtime",
    });
  }
};

// UPDATE SHOWTIME

export const updateShowtime = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Valid Showtime ID is required",
      });
    }

    const {
      movie_id,
      auditorium_id,
      format,
      date,
      start_time,
      end_time,
      standard_price,
      prime_price,
    } = req.body;

    if (
      !movie_id ||
      !auditorium_id ||
      !format ||
      !date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    if (
      standard_price === undefined ||
      prime_price === undefined ||
      !Number.isFinite(Number(standard_price)) ||
      !Number.isFinite(Number(prime_price)) ||
      Number(standard_price) <= 0 ||
      Number(prime_price) <= 0
    ) {
      return res.status(400).json({
        message: "Valid ticket prices are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message: "End time must be greater than start time",
      });
    }

    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, Number(movie_id)));

    if (movie.length === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const auditorium = await db
      .select()
      .from(auditoriums)
      .where(eq(auditoriums.id, Number(auditorium_id)));

    if (auditorium.length === 0) {
      return res.status(404).json({
        message: "Auditorium not found",
      });
    }

    const existingShowtime = await db
      .select()
      .from(showtimes)
      .where(eq(showtimes.id, id));

    if (existingShowtime.length === 0) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    const conflictingShowtimes = await db
      .select()
      .from(showtimes)
      .where(
        and(
          eq(showtimes.auditorium_id, Number(auditorium_id)),
          eq(showtimes.date, date),
          lt(showtimes.start_time, end_time),
          gt(showtimes.end_time, start_time)
        )
      );

    const realConflict = conflictingShowtimes.filter(
      (showtime) => showtime.id !== id
    );

    if (realConflict.length > 0) {
      return res.status(409).json({
        message: "Showtime conflict: Auditorium is already occupied",
      });
    }

    const updatedShowtime = await db
      .update(showtimes)
      .set({
        movie_id: Number(movie_id),
        auditorium_id: Number(auditorium_id),
        format,
        date,
        start_time,
        end_time,
        standard_price,
        prime_price,
        updated_at: new Date(),
      })
      .where(eq(showtimes.id, id))
      .returning();

    return res.status(200).json({
      message: "Showtime updated successfully",
      updatedShowtime,
    });

  } catch (error) {
    console.error("Update Showtime Error:", error);

    return res.status(500).json({
      message: "Failed to update showtime",
    });
  }
};

// DELETE SHOWTIME

export const deleteShowtime = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Valid Showtime ID is required",
      });
    }

    const deletedShowtime = await db
      .delete(showtimes)
      .where(eq(showtimes.id, id))
      .returning();

    if (deletedShowtime.length === 0) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    return res.status(200).json({
      message: "Showtime deleted successfully",
      deletedShowtime,
    });

  } catch (error) {
    console.error("Delete Showtime Error:", error);

    return res.status(500).json({
      message: "Failed to delete showtime",
    });
  }
};
