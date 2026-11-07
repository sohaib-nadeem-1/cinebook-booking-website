
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../schema/user.schema.js";
import { showtimes } from "../schema/showTime.schema.js";

export const enumStatus = pgEnum("booking_status", [
  "confirmed",
  "pending",
  "cancelled",
  "refunded",
]);

export const booking = pgTable("bookings", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),

  showtime_id: integer("showtime_id")
    .references(() => showtimes.id)
    .notNull(),

  total_amount: numeric("total_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  status: enumStatus("status")
    .notNull()
    .default("pending"),

  created_at: timestamp("created_at").defaultNow(),

  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});
