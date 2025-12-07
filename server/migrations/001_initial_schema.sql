-- Инициализация базы данных для галереи
-- Миграция 001: создание начальной схемы

-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица разрешений
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Связующая таблица ролей и разрешений
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(500), -- Добавьте эту строку
    role_id INTEGER NOT NULL REFERENCES roles(id) DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица refresh токенов
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_ip VARCHAR(45)
);

-- Таблица художников
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- если художник также пользователь системы
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица выставок
CREATE TABLE IF NOT EXISTS exhibitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    organizer VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    max_visitors_per_slot INTEGER DEFAULT 50,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date)
);

-- Таблица картин
CREATE TABLE IF NOT EXISTS artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id INTEGER NOT NULL REFERENCES artists(id),
    exhibition_id INTEGER REFERENCES exhibitions(id),
    creation_year INTEGER,
    medium VARCHAR(100), -- техника исполнения (масло, акварель и т.д.)
    dimensions VARCHAR(50), -- размеры (ширина x высота)
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_for_sale BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'available', -- available, sold, reserved, on_loan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица расписания выставок
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_visitors INTEGER DEFAULT 50,
    current_visitors INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exhibition_id, date, start_time)
);

-- Таблица бронирований
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    schedule_id INTEGER NOT NULL REFERENCES schedules(id),
    exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id),
    number_of_visitors INTEGER NOT NULL DEFAULT 1,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    total_price DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (number_of_visitors > 0 AND number_of_visitors <= 10)
);

-- Таблица транзакций (для продаж картин)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id), -- галерея или представитель
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sale_price DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2), -- комиссия галереи
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    transaction_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица отзывов о выставках
CREATE TABLE IF NOT EXISTS exhibition_reviews (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exhibition_id, user_id)
);

-- Таблица заявок на повышенный доступ
CREATE TABLE IF NOT EXISTS access_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_role VARCHAR(50) NOT NULL CHECK (requested_role IN ('artist', 'curator')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_id ON artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedules_exhibition_id ON schedules(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_requested_role ON access_requests(requested_role);

-- Вставляем базовые роли
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Администратор системы с полными правами'),
(2, 'user', 'Обычный пользователь'),
(3, 'curator', 'Куратор выставок'),
(4, 'artist', 'Художник')
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description;

-- Вставляем базовые разрешения
INSERT INTO permissions (id, name, description, category) VALUES
-- Пользовательские разрешения
(1, 'user:read', 'Просмотр пользователей', 'users'),
(2, 'user:write', 'Создание и редактирование пользователей', 'users'),
(3, 'user:delete', 'Удаление пользователей', 'users'),

-- Разрешения для художников
(4, 'artist:read', 'Просмотр художников', 'artists'),
(5, 'artist:write', 'Создание и редактирование художников', 'artists'),
(6, 'artist:delete', 'Удаление художников', 'artists'),

-- Разрешения для картин
(7, 'artwork:read', 'Просмотр картин', 'artworks'),
(8, 'artwork:write', 'Создание и редактирование картин', 'artworks'),
(9, 'artwork:delete', 'Удаление картин', 'artworks'),

-- Разрешения для выставок
(10, 'exhibition:read', 'Просмотр выставок', 'exhibitions'),
(11, 'exhibition:write', 'Создание и редактирование выставок', 'exhibitions'),
(12, 'exhibition:delete', 'Удаление выставок', 'exhibitions'),

-- Разрешения для бронирований
(13, 'booking:read', 'Просмотр бронирований', 'bookings'),
(14, 'booking:write', 'Создание бронирований', 'bookings'),
(15, 'booking:manage', 'Управление всеми бронированиями', 'bookings'),

-- Административные разрешения
(16, 'system:config', 'Настройка системы', 'system'),
(17, 'reports:view', 'Просмотр отчетов', 'system')
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
category = EXCLUDED.category;

-- Назначаем разрешения для роли admin (все разрешения)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 1, id, true FROM permissions
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true;

-- Назначаем разрешения для роли user (базовые разрешения)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
(2, 4, true),  -- artist:read
(2, 7, true),  -- artwork:read
(2, 10, true), -- exhibition:read
(2, 13, true), -- booking:read
(2, 14, true)  -- booking:write
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = EXCLUDED.granted;

-- Назначаем разрешения для роли curator
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
(3, 4, true),  -- artist:read
(3, 5, true),  -- artist:write
(3, 7, true),  -- artwork:read
(3, 8, true),  -- artwork:write
(3, 10, true), -- exhibition:read
(3, 11, true), -- exhibition:write
(3, 13, true), -- booking:read
(3, 15, true), -- booking:manage
(3, 17, true)  -- reports:view
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = EXCLUDED.granted;

-- Назначаем разрешения для роли artist
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
(4, 7, true),  -- artwork:read
(4, 8, true),  -- artwork:write (только свои работы)
(4, 10, true)  -- exhibition:read
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = EXCLUDED.granted;

-- Создаем или заменяем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ... предыдущий код ...

-- Применяем триггеры к таблицам (с проверкой на существование)
DO $$ 
BEGIN
    -- Для таблицы users
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Для таблицы artists
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artists_updated_at') THEN
        CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Для таблицы artworks
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artworks_updated_at') THEN
        CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Для таблицы exhibitions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_exhibitions_updated_at') THEN
        CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Для таблицы bookings
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Триггер для обновления updated_at в access_requests
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_access_requests_updated_at') THEN
        CREATE TRIGGER update_access_requests_updated_at 
        BEFORE UPDATE ON access_requests 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
END $$;  -- Вот здесь добавляем точку с запятой!

-- Обновляем последовательности после ручной вставки ID
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));