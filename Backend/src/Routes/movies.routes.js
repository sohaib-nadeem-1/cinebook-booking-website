import express from "express";

import {
  createMovies,
  deleteMovie,
  getAllMovies,
  getSingleMovie,
  updateMovies,
} from "../controllers/movie.controller.js";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { roleMiddleware } from "../Middlewares/role.middleware.js";

const router = express.Router();

// PUBLIC ROUTES

// Anyone can view all movies
router.get("/all-movies", getAllMovies);

// Anyone can view movie details
router.get("/movie/:id", getSingleMovie);

// PROTECTED ADMIN ROUTES

// Only authenticated admins can create movies
router.post(
  "/create-movie",
  authMiddleware,
  roleMiddleware("admin", "Box Office Staff"),
  createMovies
);

// Only authenticated admins can update movies
router.put(
  "/movie/:id",
  authMiddleware,
  roleMiddleware("admin", "Box Office Staff"),
  updateMovies
);

// Only authenticated admins can delete movies
router.delete(
  "/movie/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteMovie
);

export default router;