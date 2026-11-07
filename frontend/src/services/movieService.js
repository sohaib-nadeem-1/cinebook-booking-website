
import { api, ApiError } from "./api.js";
import { slugify } from "../utils/format.js";

const SORTS = {
  popularity: (a, b) => (b.popularity || 0) - (a.popularity || 0),
  rating: (a, b) => (b.score || 0) - (a.score || 0),
  newest: (a, b) =>
    (b.releaseDate || "").localeCompare(a.releaseDate || ""),
  title: (a, b) => a.title.localeCompare(b.title),
  runtime: (a, b) => a.runtime - b.runtime,
};

export const SORT_OPTIONS = [
  ["popularity", "Popularity"],
  ["rating", "Top Rated"],
  ["newest", "Newest"],
  ["title", "Title A–Z"],
  ["runtime", "Shortest runtime"],
];

// Backend status -> Frontend status
const statusToFrontend = {
  "Coming Soon": "coming_soon",
  "Now Showing": "now_showing",
  Ended: "archived",
};

// Frontend status -> Backend status
const statusToBackend = {
  advance_booking: "Coming Soon",
  coming_soon: "Coming Soon",
  now_showing: "Now Showing",
  archived: "Ended",
};

// Convert backend movie into frontend format
const mapMovie = (movie) => ({
  id: movie.id,
  slug: slugify(movie.title),

  title: movie.title,
  runtime: Number(movie.runtime),

  releaseDate: movie.release_date || "",
  rating: movie.age_rating,

  status: statusToFrontend[movie.status] || movie.status,

  director: movie.director || "TBA",
  language: movie.language || "English",

  genres: movie.genres || [],
  formats: movie.formats || [],

  poster: movie.poster_url || null,
  backdrop: movie.poster_url || null,

  synopsis: movie.synopsis || "Synopsis coming soon.",

  // These fields do not exist in the current DB schema.
  cast: [],
  featured: false,
  popularity: 0,
  score: 0,
  votes: "—",
  rt: 0,
  trailer: "2m 00s",
  sound: "Atmos",
  badge: movie.formats?.[0] || "",
});

// Convert frontend data into backend format
const mapPayload = (data) => {
  const payload = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.runtime !== undefined) {
    payload.runtime = Number(data.runtime);
  }

  if (data.releaseDate !== undefined) {
    payload.release_date = data.releaseDate;
  }

  if (data.rating !== undefined) {
    payload.age_rating = data.rating;
  }

  if (data.status !== undefined) {
    payload.status =
      statusToBackend[data.status] || data.status;
  }

  if (data.director !== undefined) {
    payload.director = data.director;
  }

  if (data.language !== undefined) {
    payload.language = data.language;
  }

  if (data.genres !== undefined) {
    payload.genres = data.genres;
  }

  if (data.formats !== undefined) {
    payload.formats = data.formats;
  }

  if (data.poster !== undefined) {
    payload.poster_url = data.poster;
  }

  if (data.synopsis !== undefined) {
    payload.synopsis = data.synopsis;
  }

  return payload;
};

// Frontend validation
const validate = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!data.genres?.length) {
    errors.genres = "Choose at least one genre";
  }

  if (!(Number(data.runtime) >= 30 && Number(data.runtime) <= 360)) {
    errors.runtime = "Runtime must be 30–360 minutes";
  }

  if (!data.releaseDate) {
    errors.releaseDate = "Release date is required";
  }

  if (!data.rating) {
    errors.rating = "Select an age rating";
  }

  if (!data.formats?.length) {
    errors.formats = "Choose at least one format";
  }

  return errors;
};

const getMovieFromResponse = (response, key) => {
  const result = response[key];

  if (Array.isArray(result)) {
    return result[0] || null;
  }

  return result || null;
};

export const movieService = {
  // =====================================
  // GET ALL MOVIES
  // =====================================

  list: async ({
    search = "",
    genre,
    format,
    language,
    rating,
    sort = "popularity",
    status,
    scope = "public",
  } = {}) => {
    const response = await api.get("/all-movies");

    const movies = (response.allMovies || []).map(mapMovie);

    const query = search.trim().toLowerCase();

    return movies
      .filter((movie) => {
        if (scope === "public" && movie.status === "archived") {
          return false;
        }

        if (
          status === "now_showing" &&
          !["now_showing", "advance_booking"].includes(movie.status)
        ) {
          return false;
        }

        if (status && status !== "now_showing" && movie.status !== status) {
          return false;
        }

        if (genre && !movie.genres.includes(genre)) {
          return false;
        }

        if (format && !movie.formats.includes(format)) {
          return false;
        }

        if (language && movie.language !== language) {
          return false;
        }

        if (rating && movie.rating !== rating) {
          return false;
        }

        const searchableText = [
          movie.title,
          movie.director,
          ...movie.cast.map((person) => person.name),
          ...movie.genres,
        ]
          .join(" ")
          .toLowerCase();

        if (query && !searchableText.includes(query)) {
          return false;
        }

        return true;
      })
      .sort(SORTS[sort] || SORTS.popularity);
  },

  // =====================================
  // GET SINGLE MOVIE
  // =====================================

  getBySlug: async (slug) => {
    let movie;

    // Numeric ID can use the single movie endpoint.
    if (/^\d+$/.test(String(slug))) {
      const response = await api.get(`/movie/${slug}`);

      movie = getMovieFromResponse(response, "getMovie");
    } else {
      // Slug is generated on frontend because DB has no slug column.
      const response = await api.get("/all-movies");

      const movies = (response.allMovies || []).map(mapMovie);

      movie = movies.find(
        (item) => item.slug === slug
      );
    }

    if (!movie) {
      throw new ApiError(
        "We couldn't find that movie.",
        "NOT_FOUND"
      );
    }

    return movie.id !== undefined && movie.slug
      ? movie
      : mapMovie(movie);
  },

  // =====================================
  // CREATE MOVIE
  // =====================================

  create: async (data) => {
    const errors = validate(data);

    if (Object.keys(errors).length) {
      throw Object.assign(
        new ApiError(
          "Please fix the highlighted fields.",
          "VALIDATION"
        ),
        { errors }
      );
    }

    const payload = mapPayload(data);

    const response = await api.post(
      "/create-movie",
      payload
    );

    const movie = getMovieFromResponse(
      response,
      "savingMovies"
    );

    if (!movie) {
      throw new ApiError(
        "Movie was not returned by server.",
        "INVALID_RESPONSE"
      );
    }

    return mapMovie(movie);
  },

  // =====================================
  // UPDATE MOVIE
  // =====================================

  update: async (id, data) => {
    const existingMovie = await movieService.getBySlug(id);

    const updatedData = {
      ...existingMovie,
      ...data,
    };

    const errors = validate(updatedData);

    if (Object.keys(errors).length) {
      throw Object.assign(
        new ApiError(
          "Please fix the highlighted fields.",
          "VALIDATION"
        ),
        { errors }
      );
    }

    const payload = mapPayload(data);

    const response = await api.put(
      `/movie/${id}`,
      payload
    );

    const movie = getMovieFromResponse(
      response,
      "updatingMovies"
    );

    if (!movie) {
      throw new ApiError(
        "Movie was not returned by server.",
        "INVALID_RESPONSE"
      );
    }

    return mapMovie(movie);
  },

  // =====================================
  // UPDATE MOVIE STATUS
  // =====================================

  setStatus: async (id, status) => {
    return movieService.update(id, { status });
  },

  // =====================================
  // DELETE MOVIE
  // =====================================

  remove: async (id) => {
    const response = await api.delete(`/movie/${id}`);

    return {
      id,
      response,
    };
  },
};
