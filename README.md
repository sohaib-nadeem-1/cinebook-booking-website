# CineBook

Movie ticket booking and cinema management application.

## Project structure

- `frontend/` — React, Vite and Tailwind CSS
- `Backend/` — Express API, PostgreSQL and Drizzle ORM

## Backend setup

```bash
cd Backend
npm install
```

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string (Neon works)
- `JWT_SECRET_KEY` — long random secret
- `PORT` — optional; defaults to `3000`

Then run migrations and start the API:

```bash
npm run db:migrate
npm run dev
```

The backend manifest and Drizzle configuration are included. Review migration files against your existing database before applying them to production.

## Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` if the API is not running at the default URL:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

## Booking behavior

- Booking creation validates the showtime, seat ownership, duplicate IDs and availability inside a database transaction.
- Requests for a showtime serialize on its showtime row to prevent two concurrent checkouts from confirming the same seat.
- Confirmed bookings occupy seats. Cancelled/refunded bookings no longer occupy them.
- Standard, prime and VIP lounge seat prices are calculated by the backend. VIP is 125% of the prime price, rounded to the nearest 0.50, matching the frontend pricing rule.
- Customers can view only their own bookings. Admin and Box Office Staff can view and cancel all bookings.
- Ticket QR codes contain a signed, expiring verification URL. The public verification endpoint only accepts valid, confirmed tickets.

## Important production configuration

This repository does not contain production secrets. Never commit `.env`, database credentials, JWT secrets, or API keys.

Payment processing, automated email delivery, and a live refund provider are not configured because they require provider accounts and credentials. The admin UI therefore exposes cancellation, not a simulated real-money refund.
