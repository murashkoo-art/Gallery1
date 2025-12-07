const { Pool } = require('pg');

// Загружаем переменные окружения
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Существующие таблицы:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log(`\nВсего таблиц: ${result.rows.length}`);
  } catch (error) {
    console.error('Ошибка при проверке таблиц:', error.message);
  } finally {
    await pool.end();
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  checkTables();
}

module.exports = checkTables;