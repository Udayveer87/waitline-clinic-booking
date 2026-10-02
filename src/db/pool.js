const mysql = require('mysql2/promise');

// A single shared connection pool. The locking transaction in
// booking.service.js borrows one connection from here for its whole
// BEGIN...COMMIT, same as every other query.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'waitline',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
