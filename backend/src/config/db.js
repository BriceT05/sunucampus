require('dotenv').config();
const mysql = require('mysql2/promise');

const isTiDB = (process.env.DB_HOST || '').includes('tidbcloud.com');

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306'),
  user:              process.env.DB_USER     || 'gestionnaire_res',
  password:          process.env.DB_PASSWORD || 'Gest2026#Res',
  database:          process.env.DB_NAME     || 'residence_univ',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          '+00:00',
  charset:           'utf8mb4',
  ...(isTiDB && { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }),
});

pool.getConnection()
  .then(conn => { console.log('✅ MySQL connecté'); conn.release(); })
  .catch(err  => console.error('❌ MySQL erreur:', err.message));

module.exports = pool;
