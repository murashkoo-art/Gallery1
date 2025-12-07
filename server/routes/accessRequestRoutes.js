// routes/accessRequestRoutes.js
const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Публичные маршруты (для всех авторизованных пользователей)
router.post('/requests', accessRequestController.createRequest);
router.get('/requests/my', accessRequestController.getMyRequests);
router.get('/requests/check-eligibility', accessRequestController.checkEligibility);
router.get('/requests/:id', accessRequestController.getRequestById);
router.put('/requests/:id/cancel', accessRequestController.cancelRequest);

// Административные маршруты (только для админов)
router.get('/admin/requests', (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}, accessRequestController.getAllRequests);

router.put('/admin/requests/:id/approve', (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}, accessRequestController.approveRequest);

router.put('/admin/requests/:id/reject', (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}, accessRequestController.rejectRequest);

router.get('/admin/requests/stats', (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}, accessRequestController.getStats);

module.exports = router;