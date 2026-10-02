const path = require('path');
const express = require('express');
const cors = require('cors');
const slotsRouter = require('./routes/slots.routes');
const bookingsRouter = require('./routes/bookings.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/slots', slotsRouter);
app.use('/api/bookings', bookingsRouter);

// Plain HTML/CSS/JS frontend — Express serves it straight from /public,
// same pattern as the other projects.
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(errorHandler);

module.exports = app;
