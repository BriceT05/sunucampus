require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  user:              process.env.DB_USER     || 'gestionnaire_res',
  password:          process.env.DB_PASSWORD || 'Gest2026#Res',
  database:          process.env.DB_NAME     || 'residence_univ',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          '+00:00',
  charset:           'utf8mb4',
});

pool.getConnection()
  .then(conn => { console.log('✅ MySQL connecté'); conn.release(); })
  .catch(err  => console.error('❌ MySQL erreur:', err.message));

module.exports = pool;
