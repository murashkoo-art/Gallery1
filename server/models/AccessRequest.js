// models/AccessRequest.js
const db = require('../config/database');

class AccessRequest {
  // Создать новую заявку
  static async create(userId, requestedRole, message = null) {
    try {
      const result = await db.query(
        `INSERT INTO access_requests (user_id, requested_role, message, status) 
         VALUES ($1, $2, $3, 'pending') 
         RETURNING *`,
        [userId, requestedRole, message]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating access request: ${error.message}`);
    }
  }

  // Получить заявку по ID
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT ar.*, 
                u.username as user_username,
                u.email as user_email,
                u.first_name as user_first_name,
                u.last_name as user_last_name,
                u.role_id as user_role_id,
                r.name as user_role_name,
                ru.username as reviewer_username
         FROM access_requests ar
         JOIN users u ON ar.user_id = u.id
         JOIN roles r ON u.role_id = r.id
         LEFT JOIN users ru ON ar.reviewed_by = ru.id
         WHERE ar.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding access request: ${error.message}`);
    }
  }

  // Получить все заявки с фильтрацией
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT ar.*, 
               u.username as user_username,
               u.email as user_email,
               u.first_name as user_first_name,
               u.last_name as user_last_name,
               u.role_id as user_role_id,
               r.name as user_role_name,
               ru.username as reviewer_username
        FROM access_requests ar
        JOIN users u ON ar.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN users ru ON ar.reviewed_by = ru.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND ar.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.requestedRole) {
        query += ` AND ar.requested_role = $${paramCount}`;
        params.push(filters.requestedRole);
        paramCount++;
      }

      if (filters.userId) {
        query += ` AND ar.user_id = $${paramCount}`;
        params.push(filters.userId);
        paramCount++;
      }

      query += ` ORDER BY ar.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all access requests: ${error.message}`);
    }
  }

  // Получить активную (pending) заявку пользователя
  static async findPendingByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM access_requests 
         WHERE user_id = $1 AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding pending request: ${error.message}`);
    }
  }

  // Обновить статус заявки
  static async updateStatus(id, status, reviewedBy = null) {
    try {
      const result = await db.query(
        `UPDATE access_requests 
         SET status = $1, 
             reviewed_by = $2, 
             reviewed_at = CASE WHEN $2 IS NOT NULL THEN NOW() ELSE reviewed_at END,
             updated_at = NOW()
         WHERE id = $3 
         RETURNING *`,
        [status, reviewedBy, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating access request: ${error.message}`);
    }
  }

  // Отменить заявку (только пользователь)
  static async cancel(id, userId) {
    try {
      const result = await db.query(
        `UPDATE access_requests 
         SET status = 'cancelled', 
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND status = 'pending'
         RETURNING *`,
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error cancelling access request: ${error.message}`);
    }
  }

  // Удалить заявку
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM access_requests WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting access request: ${error.message}`);
    }
  }

  // Статистика заявок
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          status,
          requested_role,
          COUNT(*) as count
        FROM access_requests
        GROUP BY status, requested_role
        ORDER BY requested_role, status
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting access request stats: ${error.message}`);
    }
  }
}

module.exports = AccessRequest;