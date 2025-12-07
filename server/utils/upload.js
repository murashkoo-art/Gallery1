// server/utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папки если они не существуют
const uploadsDir = path.join(__dirname, '../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const artworksDir = path.join(uploadsDir, 'artworks');

[uploadsDir, avatarsDir, artworksDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Специализированные конфигурации
const uploadConfig = {
    // Для аватаров пользователей
    avatar: multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, avatarsDir);
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileExtension = path.extname(file.originalname);
                const fileName = 'avatar-' + (req.user?.id || 'guest') + '-' + uniqueSuffix + fileExtension;
                cb(null, fileName);
            }
        }),
        fileFilter: fileFilter,
        limits: {
            fileSize: 2 * 1024 * 1024,
            files: 1
        }
    }),
    
    // Для картин
    artwork: multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, artworksDir);
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileExtension = path.extname(file.originalname);
                const fileName = 'artwork-' + uniqueSuffix + fileExtension;
                cb(null, fileName);
            }
        }),
        fileFilter: fileFilter,
        limits: {
            fileSize: 20 * 1024 * 1024,
            files: 10 // ← ОСТАВЛЯЕМ 10 ФАЙЛОВ ДЛЯ galleryRoutes
        }
    })
};

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
        return res.status(400).json({ error: 'Upload error' });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

module.exports = {
    ...uploadConfig,
    handleUploadError
};