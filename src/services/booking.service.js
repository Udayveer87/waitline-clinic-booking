const pool = require('../db/pool');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Books a slot, safely, under concurrency.
 *
 * The bug this fixes: without locking, two requests can both read
 * "0 of 1 seats taken" at the same instant, and both then insert a
 * booking — the slot ends up with 2 bookings for 1 seat.
 *
 * The fix: `SELECT ... FOR UPDATE` inside a transaction locks the slot
 * row for the rest of this transaction. If a second request comes in for
 * the same slot while this one is still running, it blocks right there
 * on the SELECT until this transaction commits or rolls back — so the
 * "count bookings, then insert if there's room" check below can never
 * race with itself.
 */
async function bookSlot({ slotId, patientName, patientEmail }) {
  if (!slotId || !patientName || !patientEmail) {
    throw new AppError('slotId, patientName and patientEmail are required', 400);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [slotRows] = await connection.query(
      'SELECT id, capacity FROM slots WHERE id = ? FOR UPDATE',
      [slotId]
    );

    if (slotRows.length === 0) {
      throw new AppError('Slot not found', 404);
    }
    const slot = slotRows[0];

    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS count FROM bookings WHERE slot_id = ? AND status = 'confirmed'`,
      [slotId]
    );
    const bookedSeats = countRows[0].count;

    if (bookedSeats >= slot.capacity) {
      throw new AppError('This slot is fully booked', 409);
    }

    const [result] = await connection.query(
      `INSERT INTO bookings (slot_id, patient_name, patient_email, status)
       VALUES (?, ?, ?, 'confirmed')`,
      [slotId, patientName, patientEmail]
    );
    const [[booking]] = await connection.query('SELECT * FROM bookings WHERE id = ?', [
      result.insertId,
    ]);

    await connection.commit();
    return booking;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { bookSlot, AppError };
