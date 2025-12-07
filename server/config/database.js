const { Pool } = require('pg')
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gallery_db',
  password: process.env.DB_PASSWORD || '123',
  port: process.env.DB_PORT || 5432,
})

// Функция для проверки подключения
async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('База данных подключена успешно:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error.message)
    return false
  }
}

// Функция для выполнения запросов к БД
function query(text, params) {
  return pool.query(text, params)
}

module.exports = {
  pool,
  query,
  checkConnection 
}