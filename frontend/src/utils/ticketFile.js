
import { formatDate, money, time12 } from "./format.js";

const esc = (value) =>
  String(value ?? "")
    .replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[char]);

const safeDate = (date) => {
  if (!date) return "Unavailable";

  try {
    return formatDate(String(date).slice(0, 10), {
      weekday: true,
    });
  } catch {
    return "Unavailable";
  }
};

const safeTime = (time) => {
  if (!time) return "Unavailable";

  try {
    return time12(time);
  } catch {
    return "Unavailable";
  }
};

/** Self-contained printable ticket. */
export function ticketHtml(b, qrMarkup = "") {
  const booking = b || {};

  const id = booking.id ?? "N/A";

  const movieTitle =
    booking.movieTitle ||
    booking.movie?.title ||
    "Movie unavailable";

  const cinemaName =
    booking.cinemaName ||
    booking.cinemaShort ||
    booking.cinema?.name ||
    "Cinema unavailable";

  const format = booking.format || "MOVIE";

  const auditoriumName =
    booking.auditoriumName || "Unavailable";

  const customerName =
    booking.customer?.name ||
    booking.user?.name ||
    booking.guest?.name ||
    "Registered Customer";

  const seats = Array.isArray(booking.seats)
    ? booking.seats
    : [];

  const seatLabels = seats.length
    ? seats
        .map(
          (seat) =>
            seat.id ||
            seat.seat_number ||
            seat.dbId ||
            "Seat"
        )
        .join(", ")
    : "Unavailable";

  const total = Number(
    booking.total ??
    booking.total_amount ??
    booking.totalAmount ??
    0
  );

  const date = safeDate(booking.date);

  const time = safeTime(
    booking.start || booking.start_time
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CineBook Ticket ${esc(id)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">

<style>
body{
  margin:0;
  background:#0b0d13;
  color:#e2e2eb;
  font-family:Inter,Arial,sans-serif;
  display:grid;
  place-items:center;
  min-height:100vh;
  padding:24px
}
.t{
  width:760px;
  max-width:100%;
  background:#191b22;
  border:1px solid #2c344a;
  border-radius:20px;
  overflow:hidden;
  display:grid;
  grid-template-columns:1fr 220px
}
.bar{
  height:6px;
  background:linear-gradient(90deg,#e50914,#f43f5e,#ee9800);
  grid-column:1/-1
}
.l{padding:28px}
.r{
  border-left:2px dashed #3b4664;
  padding:28px;
  text-align:center;
  background:#0c0e14
}
h1{
  font-size:30px;
  margin:6px 0 2px;
  color:#fff
}
.k{
  font-size:10px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:#a9a3b5
}
.v{
  font-size:16px;
  font-weight:700;
  margin-top:2px
}
.a{color:#ffb95f}
.g{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:16px;
  margin-top:22px
}
.f{
  margin-top:22px;
  border-top:1px dashed #3b4664;
  padding-top:14px;
  display:flex;
  justify-content:space-between;
  gap:12px
}
.brand{font-weight:800;color:#fff}
.brand b{color:#e50914}
@media(max-width:640px){
  .t{grid-template-columns:1fr}
  .r{
    border-left:0;
    border-top:2px dashed #3b4664
  }
}
@media print{
  body{background:#fff}
}
</style>
</head>

<body>
<div class="t">
  <div class="bar"></div>

  <div class="l">
    <div class="k a">
      ${esc(format)} • ${esc(cinemaName)}
    </div>

    <h1>${esc(movieTitle)}</h1>

    <div class="k">${esc(cinemaName)}</div>

    <div class="g">
      <div>
        <div class="k">Date</div>
        <div class="v">${esc(date)}</div>
      </div>

      <div>
        <div class="k">Showtime</div>
        <div class="v a">${esc(time)}</div>
      </div>

      <div>
        <div class="k">Screen</div>
        <div class="v">${esc(auditoriumName)}</div>
      </div>

      <div>
        <div class="k">Seats</div>
        <div class="v a">${esc(seatLabels)}</div>
      </div>
    </div>

    <div class="f">
      <div>
        <div class="k">Booking ID</div>
        <div class="v">${esc(id)}</div>
      </div>

      <div>
        <div class="k">Guest</div>
        <div class="v">${esc(customerName)}</div>
      </div>

      <div>
        <div class="k">Total</div>
        <div class="v">${esc(money(total))}</div>
      </div>
    </div>
  </div>

  <div class="r">
    ${qrMarkup || `<p class="k">QR unavailable</p>`}

    <p class="v" style="font-family:monospace;margin-top:10px">
      ${esc(id)}
    </p>

    <p class="k">Scan to verify ticket</p>

    <p class="brand" style="margin-top:20px">
      Cine<b>Book</b>
    </p>
  </div>
</div>
</body>
</html>`;
}

export function downloadTicket(b) {
  const qr = document.querySelector(`[data-booking-qr="${String(b?.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "")}"]`);
  const qrMarkup = qr?.outerHTML || "";
  const blob = new Blob(
    [ticketHtml(b, qrMarkup)],
    { type: "text/html" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `CineBook-Ticket-${b?.id ?? "booking"}.html`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
