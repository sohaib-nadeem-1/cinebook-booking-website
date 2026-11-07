import express from "express";

import {
  createShowtime,
  deleteShowtime,
  getAllShowtimes,
  getSingleShowtime,
  updateShowtime,
} from "../controllers/showtime.controller.js";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { roleMiddleware } from "../Middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/create-showtime",
  authMiddleware,
  roleMiddleware("admin", "Box Office Staff"),
  createShowtime
);

router.get("/get-show", getAllShowtimes);

router.get("/single-show/:id", getSingleShowtime);

router.put(
  "/update-show/:id",
  authMiddleware,
  roleMiddleware("admin", "Box Office Staff"),
  updateShowtime
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin", "Box Office Staff"),
  deleteShowtime
);

export default router;