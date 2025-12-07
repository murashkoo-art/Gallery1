const db = require('../config/database'); // Импорт базы данных
const bcrypt = require('bcryptjs'); // Импорт bcrypt

const userController = {
    async getProfile(req, res) {
    try {
        const user = await db.query(
            'SELECT id, username, first_name, last_name, email, phone, avatar, role_id, is_active, email_verified, last_login, created_at, updated_at FROM users WHERE id = $1',
            [req.user.id]
        );
        console.log('Full user data from DB:', user.rows[0]);
        res.json({ user: user.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    },

    async updateProfile(req, res) {
    try {
        console.log('Update profile request received:', req.body); 
        console.log('User ID from token:', req.user.id);
        
        // Теперь принимаем только эти поля (без email)
        const { first_name, last_name, phone } = req.body;
        const userId = req.user.id;
        
        // Обновляем только имя, фамилию и телефон
        const updatedUser = await db.query(
            'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, first_name, last_name, email, phone, avatar, role_id, is_active, email_verified, last_login, created_at, updated_at',
            [first_name, last_name, phone, userId] // 4 параметра
        );
        
        console.log('Profile updated:', updatedUser.rows[0]);
        
        res.json({ 
            message: 'Profile updated successfully',
            user: updatedUser.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: error.message });
    }
},

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const user = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.id]
            );
            const isValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);

            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [newPasswordHash, req.user.id]
            );
            
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async changeEmail(req, res) {
        try {
            const { email, password } = req.body;
            
            // Проверяем текущий пароль
            const user = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.id]
            );
            const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
            
            if (!isValid) {
                return res.status(400).json({ error: 'Неверный пароль' });
            }
            
            // Проверяем что email не занят
            const existingUser = await db.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, req.user.id]
            );
            
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email уже используется' });
            }
            
            // Обновляем email
            await db.query(
                'UPDATE users SET email = $1, email_verified = false, updated_at = NOW() WHERE id = $2',
                [email, req.user.id]
            );
            
            res.json({ 
                message: 'Email изменен успешно',
                email: email
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changeUsername(req, res) {
        try {
            const { username, password } = req.body;
            
            // Проверяем текущий пароль
            const user = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.id]
            );
            const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
            
            if (!isValid) {
                return res.status(400).json({ error: 'Неверный пароль' });
            }
            
            // Проверяем что username не занят
            const existingUser = await db.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username, req.user.id]
            );
            
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Имя пользователя уже занято' });
            }
            
            // Обновляем username
            await db.query(
                'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2',
                [username, req.user.id]
            );
            
            res.json({ 
                message: 'Логин изменен успешно',
                username: username
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


    async uploadAvatar(req, res) {
        try {
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            
            await db.query(
                'UPDATE users SET avatar = $1 WHERE id = $2',
                [avatarUrl, req.user.id]
            );
            
            res.json({ 
                message: 'Avatar uploaded successfully',
                avatar: avatarUrl
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteAvatar(req, res) {
        try {
            console.log('Deleting avatar for user:', req.user.id);
            
            // Получаем текущий аватар пользователя
            const userResult = await db.query(
                'SELECT avatar FROM users WHERE id = $1',
                [req.user.id]
            );
            
            const oldAvatar = userResult.rows[0]?.avatar;
            console.log('Old avatar path:', oldAvatar);
            
            if (oldAvatar) {
                // Удаляем файл с диска
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', oldAvatar);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('✅ Deleted avatar file:', filePath);
                }
            }
            
            // Обновляем БД - устанавливаем avatar в NULL
            await db.query(
                'UPDATE users SET avatar = NULL WHERE id = $1',
                [req.user.id]
            );
            
            console.log('Database updated');
            
            res.json({ 
                message: 'Avatar deleted successfully'
            });
        } catch (error) {
            console.error('Delete avatar error:', error);
            res.status(500).json({ error: error.message });
        }
    },
    async deleteAccount(req, res) {
        try {
            const { password } = req.body;
            
            // Проверяем пароль
            const user = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.id]
            );
            
            if (user.rows.length === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
            
            if (!isValid) {
                return res.status(400).json({ error: 'Неверный пароль' });
            }
            
            // Удаляем аватар если есть
            const avatarResult = await db.query(
                'SELECT avatar FROM users WHERE id = $1',
                [req.user.id]
            );
            
            const oldAvatar = avatarResult.rows[0]?.avatar;
            if (oldAvatar) {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', oldAvatar);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🗑 Deleted avatar file:', filePath);
                }
            }
            
            // TODO: Удалить связанные данные (картины, комментарии и т.д.)
            // Сначала удалим зависимые записи, потом пользователя
            
            // Удаляем пользователя
            await db.query(
                'DELETE FROM users WHERE id = $1',
                [req.user.id]
            );
            
            console.log('✅ Account deleted for user:', req.user.id);
            
            res.json({ 
                message: 'Аккаунт успешно удален'
            });
        } catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({ error: error.message });
        }
    }



};

    

module.exports = userController;