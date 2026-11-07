import "dotenv/config";
import bcrypt from "bcryptjs";

import { db } from "../db/index.js";

import { user } from "./schema/user.schema.js";
import {   cinemas } from "./schema/cinemas.schema.js";
import { auditoriums } from "./schema/auditorium.schema.js";
import { seats } from "./schema/seats.schema.js";
import { movies } from "./schema/movies.schema.js";
import { showtimes } from "./schema/showTime.schema.js";

async function seed() {
    try {
        console.log(" Seeding database...\n");
      
        const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
        const hashedStaffPassword = await bcrypt.hash("Staff@123", 10);
        const hashedCustomerPassword = await bcrypt.hash("User@123", 10);

        const users = await db
            .insert(user)
            .values([
                {
                    name: "Ali Khan",
                    username: "alikhan",
                    email: "ali.admin@example.com",
                    password: hashedAdminPassword,
                    role: "admin",
                    status: "active",
                },
                {
                    name: "Ahmed Raza",
                    username: "ahmedstaff",
                    email: "ahmed.staff@example.com",
                    password: hashedStaffPassword,
                    role: "Box Office Staff",
                    status: "active",
                },
                {
                    name: "Usman Ali",
                    username: "usmanali",
                    email: "usman.customer@example.com",
                    password: hashedCustomerPassword,
                    role: "customer",
                    status: "active",
                },
            ])
            .returning();

        console.log(`✅ Users seeded: ${users.length}`);


        // =========================
        // 2. CINEMAS
        // =========================

        const cinemasData = await db
            .insert(cinemas)
            .values([
                {
                    name: "CineBook Cinema",
                    city: "Lahore",
                    address: "Main Boulevard Gulberg, Lahore",
                    phone: "0300-1111111",
                },
                {
                    name: "CineBook Downtown",
                    city: "Islamabad",
                    address: "Blue Area, Islamabad",
                    phone: "0300-2222222",
                },
            ])
            .returning();

        console.log(`✅ Cinemas seeded: ${cinemasData.length}`);


        // =========================
        // 3. AUDITORIUMS
        // =========================

        const auditoriumsData = await db
            .insert(auditoriums)
            .values([
                {
                    cinema_id: cinemasData[0].id,
                    hall_no: 1,
                },
                {
                    cinema_id: cinemasData[0].id,
                    hall_no: 2,
                },
                {
                    cinema_id: cinemasData[1].id,
                    hall_no: 1,
                },
            ])
            .returning();

        console.log(`✅ Auditoriums seeded: ${auditoriumsData.length}`);


        // =========================
        // 4. SEATS
        // =========================

        const seatsData = [];

        for (const auditorium of auditoriumsData) {
            for (let row = 1; row <= 5; row++) {
                for (let seat = 1; seat <= 10; seat++) {

                    let category = "standard";

                    if (row === 4) {
                        category = "prime";
                    }

                    if (row === 5) {
                        category = "vip lounge";
                    }

                    seatsData.push({
                        auditorium_id: auditorium.id,
                        seat_number: `${String.fromCharCode(64 + row)}${seat}`,
                        seat_category: category,
                    });
                }
            }
        }

        const seatsInserted = await db
            .insert(seats)
            .values(seatsData)
            .returning();

        console.log(`✅ Seats seeded: ${seatsInserted.length}`);


        // =========================
        // 5. MOVIES
        // =========================

        const moviesData = await db
            .insert(movies)
            .values([
                {
                    title: "Interstellar",
                    runtime: 169,
                    release_date: "2014-11-07",
                    age_rating: "PG-13",
                    status: "Now Showing",
                    director: "Christopher Nolan",
                    language: "English",
                    genres: ["Adventure", "Drama", "Sci-Fi"],
                    formats: ["IMAX 70MM", "DOLBY CINEMA", "LASER 4K"],
                    poster_url: "https://example.com/interstellar.jpg",
                    synopsis:
                        "A team of explorers travels through a wormhole in space in search of a new home for humanity.",
                },
                {
                    title: "Inception",
                    runtime: 148,
                    release_date: "2010-07-16",
                    age_rating: "PG-13",
                    status: "Now Showing",
                    director: "Christopher Nolan",
                    language: "English",
                    genres: ["Action", "Mystery", "Sci-Fi", "Thriller"],
                    formats: ["DOLBY CINEMA", "LASER 4K"],
                    poster_url: "https://example.com/inception.jpg",
                    synopsis:
                        "A skilled thief who steals secrets through dream-sharing technology is given a chance to erase his past.",
                },
                {
                    title: "The Dark Knight",
                    runtime: 152,
                    release_date: "2008-07-18",
                    age_rating: "PG-13",
                    status: "Now Showing",
                    director: "Christopher Nolan",
                    language: "English",
                    genres: ["Action", "Crime", "Drama", "Thriller"],
                    formats: ["IMAX 70MM", "DOLBY CINEMA"],
                    poster_url: "https://example.com/dark-knight.jpg",
                    synopsis:
                        "Batman faces a criminal mastermind who plunges Gotham into chaos.",
                },
            ])
            .returning();

        console.log(`✅ Movies seeded: ${moviesData.length}`);


        // =========================
        // 6. SHOWTIMES
        // =========================

        const showtimesData = await db
            .insert(showtimes)
            .values([
                {
                    movie_id: moviesData[0].id,
                    auditorium_id: auditoriumsData[0].id,
                    format: "IMAX 70MM",
                    date: "2026-10-27",
                    start_time: "14:00:00",
                    end_time: "16:49:00",
                    standard_price: "1200",
                    prime_price: "1600",
                },
                {
                    movie_id: moviesData[1].id,
                    auditorium_id: auditoriumsData[1].id,
                    format: "DOLBY CINEMA",
                    date: "2026-10-27",
                    start_time: "17:00:00",
                    end_time: "19:28:00",
                    standard_price: "1300",
                    prime_price: "1700",
                },
                {
                    movie_id: moviesData[2].id,
                    auditorium_id: auditoriumsData[2].id,
                    format: "IMAX 70MM",
                    date: "2026-10-27",
                    start_time: "20:00:00",
                    end_time: "22:32:00",
                    standard_price: "1400",
                    prime_price: "1800",
                },
            ])
            .returning();

        console.log(`✅ Showtimes seeded: ${showtimesData.length}`);


        console.log("\n Database seeding completed successfully!");

        process.exit(0);

    } catch (error) {
        console.error("\n❌ Seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seed();