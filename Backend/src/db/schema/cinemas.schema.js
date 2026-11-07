// cinemas

// - id
// - name
// - city
// - address
// - phone
// - created_at
// - updated_at

import { pgTable,serial,text,timestamp } from "drizzle-orm/pg-core";

export const cinemas = pgTable("cinemas",{
    id : serial("id").primaryKey().notNull(),
    name : text("name").notNull(),
    city : text("city").notNull(),
    address : text("address"),
    phone : text("phone"),
    created_at : timestamp("created_at").defaultNow(),
    updated_at : timestamp("updated_at").defaultNow()
})
