// movies

// - id
// - title
// - runtime
// - release_date
// - age_rating
// - status
// - director
// - language
// - genres
// - formats
// - poster_url
// - synopsis

 
import { integer, pgEnum, pgTable,date,serial,text } from "drizzle-orm/pg-core";

export const enumAgeRating = pgEnum("age_rating",["G", "PG", "PG-13", "R", "NC-17"]);
export const enumStatus = pgEnum("status",["Coming Soon", "Now Showing", "Ended"]);

export const movies = pgTable("movies",{
    id : serial("id").notNull().primaryKey(),
    title : text("title").notNull(),
    runtime : integer("runtime").notNull(),
    release_date: date("release_date"),
    age_rating:enumAgeRating("age_rating").notNull(),
    status : enumStatus("status").notNull(),
    director : text("director"),
    language :text("language"),
    genres: text("genres").array(),
    formats : text("formats").array(),
    poster_url : text("poster_url"),
    synopsis : text("synopsis")
})