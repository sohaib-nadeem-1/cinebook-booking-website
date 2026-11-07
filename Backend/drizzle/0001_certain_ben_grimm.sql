ALTER TABLE "booking_seats" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_seats_booking_id_seat_id_unique" ON "booking_seats" USING btree ("booking_id","seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seats_auditorium_id_seat_number_unique" ON "seats" USING btree ("auditorium_id","seat_number");