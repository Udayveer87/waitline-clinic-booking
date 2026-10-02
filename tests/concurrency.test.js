// Proves the fix: fire 50 booking requests at one single-seat slot at the
// same instant. Without the row lock in booking.service.js, more than one
// would succeed. With it, exactly one does and the other 49 get a clean
// "fully booked" response instead of a corrupted double-booking.
//
// Requires the app running (npm start) against a migrated database.
// Run with: npm run test:concurrency

const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.WAITLINE_BASE_URL || 'http://localhost:4000';

test('exactly one booking wins when 50 requests hit the same single-seat slot at once', async () => {
  const slotRes = await fetch(`${BASE_URL}/api/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clinicName: 'Concurrency Test Clinic',
      doctorName: 'Dr. Test',
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      capacity: 1,
    }),
  });
  assert.equal(slotRes.status, 201, 'setup: creating the test slot should succeed');
  const slot = await slotRes.json();

  const requests = Array.from({ length: 50 }, (_, i) =>
    fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: slot.id,
        patientName: `Patient ${i}`,
        patientEmail: `patient${i}@example.com`,
      }),
    })
  );

  const responses = await Promise.all(requests);
  const statuses = responses.map((r) => r.status);

  const confirmed = statuses.filter((s) => s === 201).length;
  const rejected = statuses.filter((s) => s === 409).length;

  assert.equal(confirmed, 1, `expected exactly 1 confirmed booking, got ${confirmed}`);
  assert.equal(rejected, 49, `expected 49 "fully booked" rejections, got ${rejected}`);
  assert.equal(confirmed + rejected, 50, 'every request should resolve to either 201 or 409');
});
