// showtimes
// ├── id
// ├── movie_id
// ├── auditorium_id
// ├── format
// ├── date
// ├── start_time
// ├── end_time
// ├── standard_price
// ├── prime_price
// ├── created_at
// └── updated_at

import { serial,text,integer,timestamp,time,date, pgTable, numeric, } from "drizzle-orm/pg-core";
import { movies } from "../schema/movies.schema.js";
import { auditoriums } from "../schema/auditorium.schema.js";


export const showtimes = pgTable("showtimes",{
    id: serial("id").primaryKey().notNull(),
    movie_id : integer("movie_id").references(()=>movies.id).notNull(),
    auditorium_id : integer("auditorium_id").references(()=>auditoriums.id).notNull(),
    format : text("format").notNull(),
    date : date("date").notNull(),
    start_time : time("start_time").notNull(),
    end_time : time("end_time").notNull(),
    standard_price : numeric("standard_price").notNull(),
    prime_price : numeric("prime_price").notNull(),
    created_at : timestamp("created_at").defaultNow(),
    updated_at : timestamp("updated_at").defaultNow()
})

