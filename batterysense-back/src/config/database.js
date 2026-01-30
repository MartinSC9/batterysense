const mysql = require('mysql2/promise');

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-03:00',
};

const pool = mysql.createPool(poolConfig);

// Test de conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a MySQL - Base de datos:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = pool;
