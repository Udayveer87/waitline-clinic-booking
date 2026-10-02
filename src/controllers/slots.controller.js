const slotRepo = require('../repositories/slot.repository');

async function list(req, res, next) {
  try {
    res.json(await slotRepo.findUpcoming());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const slot = await slotRepo.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { clinicName, doctorName, startsAt, capacity } = req.body;
    if (!clinicName || !doctorName || !startsAt) {
      return res
        .status(400)
        .json({ error: 'clinicName, doctorName and startsAt are required' });
    }
    const slot = await slotRepo.create({ clinicName, doctorName, startsAt, capacity });
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create };
