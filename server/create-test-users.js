// create-test-users-fixed.js
const { Pool } = require('pg');
require('dotenv').config();

// Конфигурация подключения к базе данных
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gallery_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Пароль для всех тестовых пользователей (Password123!)
const COMMON_PASSWORD_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Начинаем создание тестовых пользователей...');
    
    await client.query('BEGIN');

    // Проверяем структуру таблицы artists
    console.log('🔍 Проверяем структуру таблиц...');
    const artistsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'artists' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Структура таблицы artists:');
    artistsColumns.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Проверяем уникальные ограничения
    const constraints = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'artists';
    `);
    
    console.log('\nОграничения таблицы artists:');
    if (constraints.rows.length === 0) {
      console.log('  Нет ограничений');
    } else {
      constraints.rows.forEach(constraint => {
        console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type} (${constraint.column_name})`);
      });
    }

    // 1. АДМИНИСТРАТОР
    console.log('\n👨‍💼 Создаем администратора...');
    
    // Удаляем существующего пользователя с id=1 если есть конфликт
    await client.query('DELETE FROM users WHERE id = 1 AND email != $1', ['admin@gallery.com']);
    
    await client.query(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, avatar, role_id, is_active, email_verified) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified,
        updated_at = CURRENT_TIMESTAMP
    `, [
      1,
      'admin',
      'admin@gallery.com',
      COMMON_PASSWORD_HASH,
      'Александр',
      'Иванов',
      '+7 (999) 123-45-67',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      1,
      true,
      true
    ]);

    // 2. КУРАТОР
    console.log('👩‍🎨 Создаем куратора...');
    await client.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, avatar, role_id, is_active, email_verified) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified,
        updated_at = CURRENT_TIMESTAMP
    `, [
      'curator_anna',
      'anna.curator@gallery.com',
      COMMON_PASSWORD_HASH,
      'Анна',
      'Петрова',
      '+7 (999) 234-56-78',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
      3,
      true,
      true
    ]);

    // 3. ХУДОЖНИК (с привязкой к учетной записи)
    console.log('🎨 Создаем художника с учетной записью...');
    
    // Сначала создаем/обновляем пользователя-художника
    const artistUserResult = await client.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, avatar, role_id, is_active, email_verified) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'artist_mikhail',
      'mikhail.artist@gallery.com',
      COMMON_PASSWORD_HASH,
      'Михаил',
      'Смирнов',
      '+7 (999) 345-67-89',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=mikhail',
      4,
      true,
      true
    ]);

    const userId = artistUserResult.rows[0].id;
    
    // Проверяем, существует ли уже художник с таким user_id
    const existingArtist = await client.query(
      'SELECT id FROM artists WHERE user_id = $1',
      [userId]
    );
    
    if (existingArtist.rows.length > 0) {
      // Обновляем существующего художника
      await client.query(`
        UPDATE artists SET
          first_name = $1,
          last_name = $2,
          bio = $3,
          birth_date = $4,
          nationality = $5,
          contact_email = $6,
          website = $7,
          is_active = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
      `, [
        'Михаил',
        'Смирнов',
        'Современный русский художник, специализирующийся на абстрактном экспрессионизме. Участник международных выставок. Работы находятся в частных коллекциях в России, Европе и США.',
        '1980-05-15',
        'Россия',
        'mikhail.artist@gallery.com',
        'https://mikhail-art.com',
        true,
        userId
      ]);
    } else {
      // Создаем нового художника
      await client.query(`
        INSERT INTO artists (user_id, first_name, last_name, bio, birth_date, nationality, contact_email, website, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId,
        'Михаил',
        'Смирнов',
        'Современный русский художник, специализирующийся на абстрактном экспрессионизме. Участник международных выставок. Работы находятся в частных коллекциях в России, Европе и США.',
        '1980-05-15',
        'Россия',
        'mikhail.artist@gallery.com',
        'https://mikhail-art.com',
        true
      ]);
    }

    // 4. ОБЫЧНЫЕ ПОЛЬЗОВАТЕЛИ
    console.log('👥 Создаем обычных пользователей...');
    
    const regularUsers = [
      {
        username: 'user_ekaterina',
        email: 'ekaterina.user@gmail.com',
        firstName: 'Екатерина',
        lastName: 'Соколова',
        phone: '+7 (999) 456-78-90',
        avatarSeed: 'ekaterina'
      },
      {
        username: 'user_dmitry',
        email: 'dmitry.user@mail.ru',
        firstName: 'Дмитрий',
        lastName: 'Кузнецов',
        phone: '+7 (999) 567-89-01',
        avatarSeed: 'dmitry'
      },
      {
        username: 'user_olga',
        email: 'olga.user@yandex.ru',
        firstName: 'Ольга',
        lastName: 'Морозова',
        phone: '+7 (999) 678-90-12',
        avatarSeed: 'olga'
      }
    ];

    for (const user of regularUsers) {
      await client.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, avatar, role_id, is_active, email_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET
          username = EXCLUDED.username,
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          phone = EXCLUDED.phone,
          avatar = EXCLUDED.avatar,
          role_id = EXCLUDED.role_id,
          is_active = EXCLUDED.is_active,
          email_verified = EXCLUDED.email_verified,
          updated_at = CURRENT_TIMESTAMP
      `, [
        user.username,
        user.email,
        COMMON_PASSWORD_HASH,
        user.firstName,
        user.lastName,
        user.phone,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`,
        2,
        true,
        true
      ]);
    }

    // 5. ИСТОРИЧЕСКИЕ ХУДОЖНИКИ (без учетных записей)
    console.log('🏛️ Создаем исторических художников...');
    
    const historicalArtists = [
      {
        firstName: 'Иван',
        lastName: 'Шишкин',
        bio: 'Великий русский художник-пейзажист, живописец, рисовальщик и гравёр-аквафортист. Академик, профессор, руководитель пейзажной мастерской Императорской Академии художеств.',
        birthDate: '1832-01-25',
        deathDate: '1898-03-20',
        nationality: 'Россия',
        contactEmail: 'info@shishkin-museum.ru',
        website: 'https://shishkin-museum.ru',
        isActive: true
      },
      {
        firstName: 'Клод',
        lastName: 'Моне',
        bio: 'Французский живописец, один из основателей импрессионизма. Известен своими пейзажами, в которых передавал богатство и изменчивость света и цвета в природе.',
        birthDate: '1840-11-14',
        deathDate: '1926-12-05',
        nationality: 'Франция',
        contactEmail: 'contact@monet-museum.fr',
        website: 'https://www.marmottan.fr',
        isActive: true
      }
    ];

    for (const artist of historicalArtists) {
      // Проверяем, существует ли художник с таким email
      const existingArtist = await client.query(
        'SELECT id FROM artists WHERE contact_email = $1',
        [artist.contactEmail]
      );
      
      if (existingArtist.rows.length > 0) {
        // Обновляем существующего художника
        await client.query(`
          UPDATE artists SET
            first_name = $1,
            last_name = $2,
            bio = $3,
            birth_date = $4,
            death_date = $5,
            nationality = $6,
            website = $7,
            is_active = $8,
            updated_at = CURRENT_TIMESTAMP
          WHERE contact_email = $9
        `, [
          artist.firstName,
          artist.lastName,
          artist.bio,
          artist.birthDate,
          artist.deathDate,
          artist.nationality,
          artist.website,
          artist.isActive,
          artist.contactEmail
        ]);
      } else {
        // Создаем нового художника
        await client.query(`
          INSERT INTO artists (first_name, last_name, bio, birth_date, death_date, nationality, contact_email, website, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          artist.firstName,
          artist.lastName,
          artist.bio,
          artist.birthDate,
          artist.deathDate,
          artist.nationality,
          artist.contactEmail,
          artist.website,
          artist.isActive
        ]);
      }
    }

    // Обновляем последовательность пользователей
    console.log('🔧 Обновляем последовательности...');
    await client.query(`
      SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
    `);

    await client.query('COMMIT');
    
    console.log('\n✅ Тестовые пользователи успешно созданы!');

    // Выводим результаты
    console.log('\n📋 Список созданных пользователей:');
    const usersResult = await client.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name || ' ' || u.last_name as full_name,
        r.name as role,
        u.is_active,
        u.email_verified,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id;
    `);
    
    if (usersResult.rows.length === 0) {
      console.log('  Пользователи не найдены');
    } else {
      console.table(usersResult.rows);
    }

    console.log('\n🎨 Список художников:');
    const artistsResult = await client.query(`
      SELECT 
        a.id,
        a.first_name || ' ' || a.last_name as artist_name,
        a.nationality,
        a.birth_date,
        CASE WHEN a.user_id IS NOT NULL THEN 'Да' ELSE 'Нет' END as has_user_account
      FROM artists a
      ORDER BY a.id;
    `);
    
    if (artistsResult.rows.length === 0) {
      console.log('  Художники не найдены');
    } else {
      console.table(artistsResult.rows);
    }

    console.log('\n🔑 Данные для входа (пароль для всех): Password123!');
    console.log('👨‍💼 Админ: admin@gallery.com');
    console.log('👩‍🎨 Куратор: anna.curator@gallery.com');
    console.log('🎨 Художник: mikhail.artist@gallery.com');
    console.log('👥 Пользователи:');
    console.log('  - ekaterina.user@gmail.com');
    console.log('  - dmitry.user@mail.ru');
    console.log('  - olga.user@yandex.ru');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Ошибка при создании тестовых пользователей:', error.message);
    console.error('Код ошибки:', error.code);
    console.error('Детали:', error.detail);
    throw error;
  } finally {
    client.release();
  }
}

// Простая версия без транзакций (если предыдущая не работает)
async function createTestUsersSimple() {
  console.log('🚀 Создание тестовых пользователей (упрощенная версия)...');
  
  try {
    // 1. Администратор
    console.log('👨‍💼 Создаем администратора...');
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role_id, is_active, email_verified) 
      VALUES (1, 'admin', 'admin@gallery.com', $1, 'Александр', 'Иванов', 1, true, true)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role_id = EXCLUDED.role_id
    `, [COMMON_PASSWORD_HASH]);

    // 2. Куратор
    console.log('👩‍🎨 Создаем куратора...');
    await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active, email_verified) 
      VALUES ('curator_anna', 'anna.curator@gallery.com', $1, 'Анна', 'Петрова', 3, true, true)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role_id = EXCLUDED.role_id
    `, [COMMON_PASSWORD_HASH]);

    // 3. Художник (пользователь)
    console.log('🎨 Создаем художника...');
    const artistResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active, email_verified) 
      VALUES ('artist_mikhail', 'mikhail.artist@gallery.com', $1, 'Михаил', 'Смирнов', 4, true, true)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role_id = EXCLUDED.role_id
      RETURNING id
    `, [COMMON_PASSWORD_HASH]);

    const userId = artistResult.rows[0].id;
    
    // Создаем запись художника (без ON CONFLICT)
    console.log('🎨 Создаем запись художника...');
    await pool.query(`
      DELETE FROM artists WHERE user_id = $1
    `, [userId]);
    
    await pool.query(`
      INSERT INTO artists (user_id, first_name, last_name, bio, nationality, contact_email, is_active)
      VALUES ($1, 'Михаил', 'Смирнов', 'Современный русский художник', 'Россия', 'mikhail.artist@gallery.com', true)
    `, [userId]);

    // 4. Обычные пользователи
    console.log('👥 Создаем обычных пользователей...');
    const users = [
      ['user_ekaterina', 'ekaterina.user@gmail.com', 'Екатерина', 'Соколова'],
      ['user_dmitry', 'dmitry.user@mail.ru', 'Дмитрий', 'Кузнецов'],
      ['user_olga', 'olga.user@yandex.ru', 'Ольга', 'Морозова']
    ];

    for (const [username, email, firstName, lastName] of users) {
      await pool.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active, email_verified) 
        VALUES ($1, $2, $3, $4, $5, 2, true, true)
        ON CONFLICT (email) DO UPDATE SET
          username = EXCLUDED.username,
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name
      `, [username, email, COMMON_PASSWORD_HASH, firstName, lastName]);
    }

    // 5. Исторические художники
    console.log('🏛️ Создаем исторических художников...');
    await pool.query(`
      INSERT INTO artists (first_name, last_name, bio, birth_date, death_date, nationality, contact_email, is_active)
      VALUES 
        ('Иван', 'Шишкин', 'Великий русский художник-пейзажист', '1832-01-25', '1898-03-20', 'Россия', 'info@shishkin-museum.ru', true),
        ('Клод', 'Моне', 'Французский живописец, импрессионист', '1840-11-14', '1926-12-05', 'Франция', 'contact@monet-museum.fr', true)
      ON CONFLICT (contact_email) DO NOTHING
    `);

    console.log('\n✅ Тестовые пользователи успешно созданы!');
    
    // Выводим результаты
    const usersResult = await pool.query(`
      SELECT id, username, email, first_name || ' ' || last_name as full_name, role_id
      FROM users 
      ORDER BY id
    `);
    
    console.log('\n📋 Создано пользователей:', usersResult.rows.length);
    console.table(usersResult.rows);

    console.log('\n🔑 Пароль для всех: Password123!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    throw error;
  }
}

// Запуск
async function main() {
  try {
    // Попробуем сначала полную версию
    await createTestUsers();
  } catch (error) {
    console.log('\n🔄 Пробуем упрощенную версию...');
    try {
      await createTestUsersSimple();
    } catch (simpleError) {
      console.error('💥 Обе версии завершились с ошибкой:', simpleError.message);
      console.error('\n💡 Возможные причины:');
      console.error('1. Таблицы не созданы (выполните миграции)');
      console.error('2. Проблемы с подключением к БД');
      console.error('3. Ошибки в SQL-синтаксисе');
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

main();