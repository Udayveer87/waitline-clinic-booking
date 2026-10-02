const pool = require('../db/pool');

async function findUpcoming() {
  const [rows] = await pool.query(`
    SELECT
      s.id, s.clinic_name, s.doctor_name, s.starts_at, s.capacity,
      s.capacity - COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS seats_left
    FROM slots s
    LEFT JOIN bookings b ON b.slot_id = s.id
    WHERE s.starts_at > NOW()
    GROUP BY s.id, s.clinic_name, s.doctor_name, s.starts_at, s.capacity
    ORDER BY s.starts_at ASC
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM slots WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ clinicName, doctorName, startsAt, capacity }) {
  const [result] = await pool.query(
    `INSERT INTO slots (clinic_name, doctor_name, starts_at, capacity) VALUES (?, ?, ?, ?)`,
    [clinicName, doctorName, startsAt, capacity || 1]
  );
  const [[slot]] = await pool.query('SELECT * FROM slots WHERE id = ?', [result.insertId]);
  return slot;
}

module.exports = { findUpcoming, findById, create };
