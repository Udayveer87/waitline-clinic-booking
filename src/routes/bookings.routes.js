const express = require('express');
const controller = require('../controllers/bookings.controller');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.listByEmail);
router.delete('/:id', controller.cancel);

module.exports = router;
