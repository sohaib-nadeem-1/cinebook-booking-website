import express from "express";
import { getShowtimeSeats } from "../controllers/seat.controller.js";

const router = express.Router();

// Public: users can view seats before logging in.
router.get("/showtime/:showtimeId", getShowtimeSeats);

export default router;