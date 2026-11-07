# CineBook — Frontend (React + Vite + Tailwind)

Complete, working frontend for the CineBook cinema platform, built from the Stitch screens,
the PRD and the **Cinematic Luxe** design system. **Frontend only** — all data is mocked and
persisted in `localStorage` behind a service layer that is ready to be swapped for a real API.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm test           # unit tests (pricing, conflicts, double-booking, auth)
```

## Demo accounts (frontend simulation only — NOT real security)

| Role | Email | Password | Portal |
|---|---|---|---|
| Customer | customer@cinebook.com | password123 | `/login` |
| System Admin | admin@cinebook.com | admin123 | `/admin/login` |
| Box Office Staff | box@cinebook.com | box12345 | `/admin/login` (no Users/Settings, can't delete movies) |

Demo card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC (a card ending `0002` simulates a decline).
Use *Settings → Reset* or clear site data to restore the seed data.

## Routes
Customer: `/`, `/movies`, `/movies/:slug`, `/booking/:showtimeId/seats`, `/checkout`, `/booking-confirmation`, `/my-bookings`, `/profile`, `/login`, `/register`
Admin: `/admin/login`, `/admin/dashboard`, `/admin/movies`, `/admin/showtimes`, `/admin/bookings`, `/admin/users`, `/admin/settings`

Guards: `/my-bookings`, `/profile` need a signed-in customer; `/checkout` also allows "Continue as Guest";
all `/admin/*` need an admin session; Users/Settings need the System Admin role.

## Architecture
```
src/
  components/{common,layout,movies,booking,seats,auth,admin}
  pages/{customer,auth,admin}     layouts/    routes/ (AppRoutes + guards)
  context/   Auth, Toast, Booking (10-min seat hold), Prefs
  services/  authService movieService showtimeService seatService bookingService userService adminService settingsService
             db.js (repository: the ONLY code touching storage) · api.js (latency/error shim) · availability.js
  data/      movies, cinemas, seats (layout profiles), users, dashboard, generator (interlinked seed data), images
  utils/     format, pricing (single source of truth for totals), validators, csv, ticketFile, storage
```
**Backend swap:** every service method is `async` and returns plain objects/throws `ApiError`.
Replace the body of a method with `fetch('/api/...')` and the UI keeps working — pages never read storage directly.
Pricing (`utils/pricing.js`) must also be enforced server-side. Seat holds (`BookingContext`) and double-booking
checks (`seatService.verify`, `bookingService.create`) are where the API's locking/transactions go.

## What is mocked (be honest about it)
* Auth, RBAC, guards: UX only. Passwords are plain text in `localStorage`.
* Payments: UI only, no gateway. QR is a non-scannable placeholder. Trailer is a placeholder stage.
* Seat hold, refunds, emails, notifications, dashboard revenue series and "rig telemetry" are simulated.
* Poster/avatar images are the Stitch-hosted URLs; if one fails to load a branded placeholder is shown.
* Showtimes auto-extend 7 days ahead as real time passes.
