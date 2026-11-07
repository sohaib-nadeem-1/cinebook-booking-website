
import { db } from "../db/index.js";
import { movies } from "../db/schema/movies.schema.js";
import { eq } from "drizzle-orm";
import { showtimes } from "../db/schema/showTime.schema.js";

export const createMovies = async (req, res) => {
    try {
        const {
            title,
            runtime,
            release_date,
            age_rating,
            status,
            director,
            language,
            genres,
            formats,
            poster_url,
            synopsis
        } = req.body;

        const savingMovies = await db
            .insert(movies)
            .values({
                title,
                runtime,
                release_date,
                age_rating,
                status,
                director,
                language,
                genres,
                formats,
                poster_url,
                synopsis
            })
            .returning();

        return res.status(201).json({
            message: "Movies Created Successfully",
            savingMovies
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create movie"
        });
    }
};


export const getAllMovies = async (req, res) => {
    try {
        const allMovies = await db
            .select()
            .from(movies);

        return res.status(200).json({
            message: "All Movies Fetched Successfully",
            allMovies
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch movies"
        });
    }
};


export const getSingleMovie = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "MovieId Not Found"
            });
        }

        const getMovie = await db
            .select()
            .from(movies)
            .where(eq(movies.id, id));

        if (getMovie.length === 0) {
            return res.status(404).json({
                message: "Movie Not Found in Db"
            });
        }

        return res.status(200).json({
            message: "Movie Fetched Successfully",
            getMovie
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch movie"
        });
    }
};


export const updateMovies = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Movie ID is required"
            });
        }

        const {
            title,
            runtime,
            release_date,
            age_rating,
            status,
            director,
            language,
            genres,
            formats,
            poster_url,
            synopsis
        } = req.body;

        const updatingMovies = await db
            .update(movies)
            .set({
                title,
                runtime,
                release_date,
                age_rating,
                status,
                director,
                language,
                genres,
                formats,
                poster_url,
                synopsis
            })
            .where(eq(movies.id, id))
            .returning();

        if (updatingMovies.length === 0) {
            return res.status(404).json({
                message: "Movie Not Found"
            });
        }

        return res.status(200).json({
            message: "Movie Updated Successfully",
            updatingMovies
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update movie"
        });
    }
};


export const deleteMovie = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Movie ID is required"
            });
        }

        const movie = await db
            .select()
            .from(movies)
            .where(eq(movies.id, id));

        if (movie.length === 0) {
            return res.status(404).json({
                message: "Movie Not Found"
            });
        }

        const movieShowtimes = await db
            .select()
            .from(showtimes)
            .where(eq(showtimes.movie_id, id));

        if (movieShowtimes.length > 0) {
            return res.status(409).json({
                message: "Cannot delete movie because showtimes exist"
            });
        }

        const deletedMovie = await db
            .delete(movies)
            .where(eq(movies.id, id))
            .returning();

        return res.status(200).json({
            message: "Movie Deleted Successfully",
            deletedMovie
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to delete movie"
        });
    }
};
