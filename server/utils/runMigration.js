const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config();

// Проверяем переменные окружения
console.log('Проверка переменных окружения...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gallery_db',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Запуск миграции базы данных...');
    
    // Проверяем соединение
    const connectionCheck = await client.query('SELECT NOW()');
    console.log('Подключение к базе данных успешно:', connectionCheck.rows[0].now);
    
    await client.query('BEGIN');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    console.log('Путь к файлу миграции:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Файл миграции не найден: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('Файл миграции загружен, размер:', migrationSQL.length, 'символов');
    
    // Выполняем весь SQL одной командой (для функций лучше так)
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Миграция успешно завершена!');
    console.log('Созданные таблицы:');
    console.log('   - users, roles, permissions, role_permissions');
    console.log('   - artists, artworks, exhibitions');
    console.log('   - schedules, bookings, transactions');
    console.log('   - refresh_tokens, exhibition_reviews');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка миграции:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем миграцию если файл запущен напрямую
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Процесс миграции завершен успешно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Процесс миграции завершен с ошибкой!');
      process.exit(1);
    });
}

module.exports = runMigration;