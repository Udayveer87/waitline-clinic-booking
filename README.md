# Waitline — Clinic Appointment Booking

A clinic appointment booking app built to fix one real problem: two people
booking the same slot at the same instant used to both succeed. Waitline
locks the slot in the database before confirming a booking, so only one
of them ever does.

## Tech Stack

- **Backend:** Node.js, Express, MySQL (via `mysql2`)
- **Frontend:** Plain HTML, CSS, and vanilla JavaScript — served straight
  from `/public`, no build step
- **Docker:** `docker-compose up --build` runs the whole app

## The double-booking fix

`src/services/booking.service.js` wraps every booking in a transaction
that starts with `SELECT ... FOR UPDATE` on the slot row. That locks the
row for the rest of the transaction, so if two booking requests arrive
for the same slot at the same time, the second one has to wait until the
first finishes — it can never read a stale "seat available" count and
double-book the slot.

`tests/concurrency.test.js` proves it: it fires 50 simultaneous booking
requests at one single-seat slot and checks that exactly 1 succeeds and
49 get a clean "fully booked" response.

```bash
npm run test:concurrency
```

## Accessibility

The whole booking flow — browsing slots, booking one, viewing and
cancelling bookings — works with just a keyboard or a screen reader:
a skip link, labeled form fields, visible focus outlines, and status
messages announced via `role="alert"`.

`tests/a11y/accessibility.spec.js` runs [axe-core](https://github.com/dequelabs/axe-core)
against every page with Playwright and fails on any serious violation.
It's wired into `.github/workflows/ci.yml`, so a regression fails CI,
not just a manual check.

```bash
npx playwright install --with-deps chromium
npm run test:a11y
```

## Features

- Browse upcoming slots with live seat counts
- Book a slot (name + email), with the slot locked against double-booking
- Look up and cancel your own bookings by email

## API Endpoints

| Method | Endpoint             | Description                          |
|--------|-----------------------|---------------------------------------|
| GET    | /api/slots            | List upcoming slots with seats left  |
| GET    | /api/slots/:id        | Get one slot                         |
| POST   | /api/slots            | Create a slot                        |
| POST   | /api/bookings         | Book a slot (the locked path)        |
| GET    | /api/bookings?email=  | List a patient's bookings            |
| DELETE | /api/bookings/:id     | Cancel a booking                     |

## Setup

```bash
npm install
cp .env.example .env
# Make sure MySQL is running locally and matches .env

npm run migrate
npm run seed      # optional sample data
npm start
```

Visit `http://localhost:4000`.

### With Docker

```bash
docker-compose up --build
```

This starts MySQL and the app together, and the app runs migrations and
seeds sample data automatically on startup.
