
import {
  serial,
  integer,
  numeric,
  timestamp,
  pgTable,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { booking } from "./bookings.schema.js";
import { seats } from "../schema/seats.schema.js";

export const booking_seats = pgTable(
  "booking_seats",
  {
    id: serial("id").primaryKey(),

    booking_id: integer("booking_id")
      .references(() => booking.id)
      .notNull(),

    seat_id: integer("seat_id")
      .references(() => seats.id)
      .notNull(),

    price: numeric("price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("booking_seats_booking_id_seat_id_unique").on(
      table.booking_id,
      table.seat_id
    ),
  ]
);
