import {
  serial,
  text,
  pgEnum,
  timestamp,
  pgTable
} from "drizzle-orm/pg-core";

export const enumStatus = pgEnum(
  "user_status",
  ["active", "inActive"]
);

export const enumRole = pgEnum(
  "user_role",
  ["customer", "Box Office Staff", "admin"]
);

export const user = pgTable("users", {
  id: serial("id").notNull().primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  phone: text("phone"),

  city: text("city"),

  role: enumRole("role").notNull().default("customer"),

  status: enumStatus("status").notNull().default("active"),

  created_at: timestamp("created_at").defaultNow(),

  updated_at: timestamp("updated_at").defaultNow()
});