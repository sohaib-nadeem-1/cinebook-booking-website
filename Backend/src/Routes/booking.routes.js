import express from "express";
import {
  getMyBookings,
  getSingleBooking,
  cancelBooking,
  createBookings,
  getAllBookings,
  getBookingByIdAdmin,
  adminCancelBooking,
  verifyTicket,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { roleMiddleware } from "../Middlewares/role.middleware.js";

const router = express.Router();
const staffOnly = roleMiddleware("admin", "Box Office Staff");

router.get("/verify/:token", verifyTicket);
router.post("/", authMiddleware, createBookings);
router.get("/my-bookings", authMiddleware, getMyBookings);

// Staff routes must be declared before /:id.
router.get("/admin/all", authMiddleware, staffOnly, getAllBookings);
router.get("/admin/:id", authMiddleware, staffOnly, getBookingByIdAdmin);
router.patch("/admin/:id/cancel", authMiddleware, staffOnly, adminCancelBooking);

router.get("/:id", authMiddleware, getSingleBooking);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

export default router;
