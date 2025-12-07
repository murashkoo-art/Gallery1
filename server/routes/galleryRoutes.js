// server/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Публичные маршруты (если нужны)
router.get('/', authMiddleware, galleryController.getAllImages);
router.get('/search', authMiddleware, galleryController.searchImages);
router.get('/:id', authMiddleware, galleryController.getImageById);

// Приватные маршруты (только для авторизованных пользователей)
router.post('/', 
    authMiddleware, 
    upload.artwork.array('images', 10), // ← ИЗМЕНЕНО
    upload.handleUploadError,
    galleryController.uploadImages
);

router.put('/:id', authMiddleware, galleryController.updateImage);
router.delete('/:id', authMiddleware, galleryController.deleteImage);

// Маршруты для управления своими изображениями
router.get('/user/my-images', authMiddleware, galleryController.getMyImages);
router.get('/user/stats', authMiddleware, galleryController.getImageStats);

module.exports = router;