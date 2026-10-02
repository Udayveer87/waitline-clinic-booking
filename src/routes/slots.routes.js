const express = require('express');
const controller = require('../controllers/slots.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', controller.create);

module.exports = router;
