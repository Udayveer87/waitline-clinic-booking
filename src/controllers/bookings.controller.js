const { bookSlot } = require('../services/booking.service');
const bookingRepo = require('../repositories/booking.repository');

async function create(req, res, next) {
  try {
    const { slotId, patientName, patientEmail } = req.body;
    const booking = await bookSlot({ slotId, patientName, patientEmail });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

async function listByEmail(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email query param is required' });
    }
    res.json(await bookingRepo.findByEmail(email));
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const booking = await bookingRepo.cancel(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listByEmail, cancel };
