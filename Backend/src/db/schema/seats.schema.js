
import {
  serial,
  integer,
  timestamp,
  pgTable,
  text,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { auditoriums } from "../schema/auditorium.schema.js";

export const enumSeats = pgEnum("category", [
  "standard",
  "prime",
  "vip lounge",
]);

export const seats = pgTable(
  "seats",
  {
    id: serial("id").primaryKey(),

    auditorium_id: integer("auditorium_id")
      .references(() => auditoriums.id)
      .notNull(),

    seat_number: text("seat_number").notNull(),

    seat_category: enumSeats("seat_category").notNull(),

    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("seats_auditorium_id_seat_number_unique").on(
      table.auditorium_id,
      table.seat_number
    ),
  ]
);
