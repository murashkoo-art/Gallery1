const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Используем db который уже экспортирует pool

function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            role: user.role_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

const authController = {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            
            // 1. Проверка существования пользователя
            const userExists = await db.query(
                'SELECT id FROM users WHERE email = $1', 
                [email]
            );
            if (userExists.rows.length > 0) {
                return res.status(400).json({ error: 'Пользователь уже существует' });
            }

            // 2. Хеширование пароля
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 3. Создание пользователя
            const newUser = await db.query(
                `INSERT INTO users (username, email, password_hash, first_name, role_id) 
                 VALUES ($1, $2, $3, $4, 2) 
                 RETURNING id, username, email, first_name, role_id`,
                [email.split('@')[0], email, passwordHash, name]
            );

            // 4. Генерация токена
            const token = generateToken(newUser.rows[0]);
            
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser.rows[0].id,
                    email: newUser.rows[0].email,
                    name: newUser.rows[0].first_name
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // 1. Поиск пользователя
            const user = await db.query(
                'SELECT id, email, password_hash, first_name, role_id FROM users WHERE email = $1',
                [email]
            );
            
            if (user.rows.length === 0) {
                return res.status(401).json({ error: 'Неверные учетные данные' });
            }

            // 2. Проверка пароля
            const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Неверные учетные данные' });
            }

            // 3. Генерация токена
            const token = generateToken(user.rows[0]);
            
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    name: user.rows[0].first_name
                }
            });
        } catch (error) {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    },

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
           
            // Валидация refresh token
            const tokenData = await db.query(
                `SELECT rt.*, u.id, u.email, u.first_name, u.role_id 
                 FROM refresh_tokens rt 
                 JOIN users u ON rt.user_id = u.id 
                 WHERE rt.token = $1 AND rt.expires_at > NOW() AND rt.is_revoked = false`,
                [refreshToken]
            );
            
            if (tokenData.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }
            
            const user = tokenData.rows[0];
            
            // Генерация нового access token
            const newToken = generateToken(user);
            
            res.json({ 
                token: newToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.first_name
                }
            });
        } catch (error) {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    },

    async logout(req, res) {
        try {
            // Получаем токен из заголовка
            const token = req.headers.authorization?.split(' ')[1];
            
            if (token) {
                // Удаляем refresh token
                await db.query(
                    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
                    [req.user.id]
                );
            }
            
            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async verifyToken(req, res) {
        try {
            // Проверка валидности токена (для фронтенда)
            // req.user устанавливается в authMiddleware
            res.json({ valid: true, user: req.user });
        } catch (error) {
            res.status(401).json({ valid: false, error: 'Invalid token' });
        }
    }
};

module.exports = authController;