// server/routes/artworkRoutes.js
const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Получить все картины
router.get('/', authMiddleware, artworkController.getAllArtworks);
router.get('/styles', authMiddleware, artworkController.getArtworkStyles);
router.get('/years', authMiddleware, artworkController.getArtworkYears);
router.get('/artist/:artistId', authMiddleware, artworkController.getArtworksByArtist);
router.get('/:id', authMiddleware, artworkController.getArtworkById);

// CRUD операции
router.post('/', 
    authMiddleware, 
    upload.artwork.single('image'),
    upload.handleUploadError,
    artworkController.createArtwork
);

router.put('/:id', authMiddleware, artworkController.updateArtwork);
router.delete('/:id', authMiddleware, artworkController.deleteArtwork);

// Для художников - их работы
router.get('/my/artworks', authMiddleware, artworkController.getMyArtworks);

module.exports = router;