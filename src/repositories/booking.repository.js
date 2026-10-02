const pool = require('../db/pool');

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT b.*, s.clinic_name, s.doctor_name, s.starts_at
     FROM bookings b
     JOIN slots s ON s.id = b.slot_id
     WHERE b.patient_email = ?
     ORDER BY s.starts_at ASC`,
    [email]
  );
  return rows;
}

async function cancel(id) {
  await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [id]);
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = { findByEmail, cancel };
