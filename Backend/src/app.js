import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./Routes/auth.route.js";
import movieRouter from "./Routes/movies.routes.js";
import showTimeRouter from "./Routes/showtime.route.js";
import bookingRouter from "./Routes/booking.routes.js";
import seatRouter from "./Routes/seat.route.js";


dotenv.config();

const app = express();

const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin.split(",").map((origin) => origin.trim()) } : {}));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "CineBook API is running",
  });
});

app.use("/api", authRouter);
app.use("/api", movieRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/seats", seatRouter);
// Showtime routes now use the same /api base URL.
app.use("/api/showtime", showTimeRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

export default app;