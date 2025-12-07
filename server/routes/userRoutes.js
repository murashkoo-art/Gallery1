const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

//router.get('/', userController.getProfile);

// Все маршруты требуют аутентификации
router.get('/', authMiddleware, userController.getProfile);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/password', authMiddleware, userController.changePassword);
router.post('/avatar', 
    authMiddleware, 
    upload.avatar.single('avatar'), 
    upload.handleUploadError,
    userController.uploadAvatar
);
router.put('/email', authMiddleware, userController.changeEmail);
router.put('/username', authMiddleware, userController.changeUsername);
router.delete('/avatar', authMiddleware, userController.deleteAvatar);
router.delete('/account', authMiddleware, userController.deleteAccount);

module.exports = router;