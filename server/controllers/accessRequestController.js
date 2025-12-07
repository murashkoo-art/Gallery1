// controllers/accessRequestController.js
const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const db = require('../config/database');

const accessRequestController = {
  // Создать заявку на повышенный доступ
  async createRequest(req, res) {
    try {
      const userId = req.user.id;
      const { requestedRole, message } = req.body;

      // Валидация входных данных
      if (!requestedRole || !['artist', 'curator'].includes(requestedRole)) {
        return res.status(400).json({ error: 'Укажите корректную роль (artist или curator)' });
      }

      // Проверка текущей роли пользователя
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем, не является ли пользователь уже художником или куратором
      if (user.role_id === 3 || user.role_id === 4) {
        return res.status(400).json({ error: 'У вас уже есть повышенный доступ' });
      }

      // Проверяем, есть ли уже активная заявка
      const existingRequest = await AccessRequest.findPendingByUserId(userId);
      if (existingRequest) {
        return res.status(400).json({ 
          error: 'У вас уже есть активная заявка, ожидающая рассмотрения',
          requestId: existingRequest.id 
        });
      }

      // Создаем заявку
      const newRequest = await AccessRequest.create(userId, requestedRole, message);

      res.status(201).json({
        message: 'Заявка на повышенный доступ успешно отправлена',
        request: newRequest
      });
    } catch (error) {
      console.error('Error creating access request:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Получить все заявки (для администратора)
  async getAllRequests(req, res) {
    try {
      const { status, requestedRole } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (requestedRole) filters.requestedRole = requestedRole;

      const requests = await AccessRequest.findAll(filters);

      res.json({
        requests,
        count: requests.length
      });
    } catch (error) {
      console.error('Error getting all access requests:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Получить заявки текущего пользователя
  async getMyRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = await AccessRequest.findAll({ userId });

      res.json({
        requests,
        count: requests.length
      });
    } catch (error) {
      console.error('Error getting user access requests:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Получить заявку по ID
  async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const request = await AccessRequest.findById(id);

      if (!request) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      // Проверка прав доступа (только пользователь, создавший заявку, или админ)
      if (req.user.role_id !== 1 && request.user_id !== req.user.id) {
        return res.status(403).json({ error: 'У вас нет прав для просмотра этой заявки' });
      }

      res.json({ request });
    } catch (error) {
      console.error('Error getting access request by id:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Одобрить заявку (только админ)
  async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Находим заявку
      const request = await AccessRequest.findById(id);
      if (!request) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: `Заявка уже ${request.status === 'approved' ? 'одобрена' : 'отклонена'}` });
      }

      // Определяем ID новой роли
      let newRoleId;
      if (request.requested_role === 'artist') {
        newRoleId = 4; // artist
      } else if (request.requested_role === 'curator') {
        newRoleId = 3; // curator
      }

      // Начинаем транзакцию
      await db.query('BEGIN');

      try {
        // Обновляем роль пользователя
        await db.query(
          'UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2',
          [newRoleId, request.user_id]
        );

        // Обновляем статус заявки
        const updatedRequest = await AccessRequest.updateStatus(id, 'approved', adminId);

        await db.query('COMMIT');

        res.json({
          message: `Заявка одобрена. Пользователь теперь ${request.requested_role === 'artist' ? 'художник' : 'куратор'}`,
          request: updatedRequest
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error approving access request:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Отклонить заявку (только админ)
  async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const { reason } = req.body;

      const request = await AccessRequest.findById(id);
      if (!request) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: `Заявка уже ${request.status === 'approved' ? 'одобрена' : 'отклонена'}` });
      }

      // Обновляем статус заявки
      const updatedRequest = await AccessRequest.updateStatus(id, 'rejected', adminId);

      res.json({
        message: 'Заявка отклонена',
        request: updatedRequest,
        reason: reason || 'Без указания причины'
      });
    } catch (error) {
      console.error('Error rejecting access request:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Отменить заявку (только пользователь)
  async cancelRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const request = await AccessRequest.findById(id);
      if (!request) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      if (request.user_id !== userId) {
        return res.status(403).json({ error: 'Вы можете отменить только свою заявку' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Можно отменить только заявки со статусом "pending"' });
      }

      const cancelledRequest = await AccessRequest.cancel(id, userId);

      res.json({
        message: 'Заявка успешно отменена',
        request: cancelledRequest
      });
    } catch (error) {
      console.error('Error cancelling access request:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Получить статистику по заявкам (только админ)
  async getStats(req, res) {
    try {
      const stats = await AccessRequest.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Error getting access request stats:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Проверить возможность подачи заявки
  async checkEligibility(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем текущую роль
      let canRequest = true;
      let message = '';
      let currentRole = '';

      if (user.role_id === 1) {
        currentRole = 'администратор';
        canRequest = false;
        message = 'Администратор уже имеет максимальные права';
      } else if (user.role_id === 3) {
        currentRole = 'куратор';
        canRequest = false;
        message = 'Вы уже являетесь куратором';
      } else if (user.role_id === 4) {
        currentRole = 'художник';
        canRequest = false;
        message = 'Вы уже являетесь художником';
      } else {
        currentRole = 'обычный пользователь';
      }

      // Проверяем наличие активной заявки
      const pendingRequest = await AccessRequest.findPendingByUserId(userId);
      const hasPendingRequest = !!pendingRequest;

      res.json({
        canRequest: canRequest && !hasPendingRequest,
        currentRole,
        hasPendingRequest,
        pendingRequestId: pendingRequest ? pendingRequest.id : null,
        message: hasPendingRequest 
          ? 'У вас есть активная заявка, ожидающая рассмотрения' 
          : message || 'Вы можете подать заявку на повышенный доступ'
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = accessRequestController;