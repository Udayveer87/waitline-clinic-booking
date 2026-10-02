CREATE TABLE IF NOT EXISTS slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clinic_name VARCHAR(255) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slots_starts_at (starts_at)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_slot FOREIGN KEY (slot_id) REFERENCES slots (id) ON DELETE CASCADE,
  INDEX idx_bookings_slot_id (slot_id)
);
