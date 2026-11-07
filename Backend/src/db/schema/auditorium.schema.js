// auditoriums

// - id
// - cinema_id
// - hall_no
// - created_at
// - updated_at

import { serial,integer,timestamp, pgTable } from "drizzle-orm/pg-core";
import { cinemas } from "../schema/cinemas.schema.js";

export const auditoriums = pgTable("auditoriums",{
    id : serial("id").primaryKey().notNull(),
    cinema_id : integer("cinema_id").references(()=>cinemas.id).notNull(),
    hall_no : integer("hall_no").notNull(),
    created_at : timestamp("created_at").defaultNow(),
    updated_at : timestamp("updated_at").defaultNow()
})