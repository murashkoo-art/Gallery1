// models/User.js
const db = require('../config/database');

class User {
  // Найти пользователя по ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Найти пользователя по email
  static async findByEmail(email) {
    try {
      const result = await db.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.email = $1`,
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Обновить роль пользователя
  static async updateRole(userId, roleId) {
    try {
      const result = await db.query(
        `UPDATE users 
         SET role_id = $1, 
             updated_at = NOW()
         WHERE id = $2 
         RETURNING *`,
        [roleId, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }
  }

  // Получить роль по имени
  static async findRoleByName(roleName) {
    try {
      const result = await db.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding role: ${error.message}`);
    }
  }
}

module.exports = User;