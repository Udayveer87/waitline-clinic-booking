require('dotenv').config();
const pool = require('./pool');

async function seed() {
  await pool.query('DELETE FROM bookings');
  await pool.query('DELETE FROM slots');

  await pool.query(`
    INSERT INTO slots (clinic_name, doctor_name, starts_at, capacity) VALUES
    ('Downtown Clinic', 'Dr. Mehta', NOW() + INTERVAL 1 DAY, 1),
    ('Downtown Clinic', 'Dr. Mehta', NOW() + INTERVAL 1 DAY + INTERVAL 2 HOUR, 3),
    ('Westside Clinic', 'Dr. Arora', NOW() + INTERVAL 2 DAY, 1),
    ('Westside Clinic', 'Dr. Arora', NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR, 5)
  `);

  console.log('Seeded sample slots.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
