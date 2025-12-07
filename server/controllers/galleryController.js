const galleryController = {
    // Получить все изображения с пагинацией
    async getAllImages(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            
            // Здесь будет запрос к БД
            const images = []; // await Image.find().skip(skip).limit(limit)
            const total = 0; // await Image.countDocuments()
            
            res.json({
                images,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Получить изображение по ID
    async getImageById(req, res) {
        try {
            const { id } = req.params;
            
            // const image = await Image.findById(id).populate('user', 'name email');
            const image = {
                id,
                title: "Example Image",
                description: "This is an example image",
                imageUrl: "/public/uploads/gallery/image-123456.jpg",
                user: {
                    id: req.user.id,
                    name: req.user.name
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            if (!image) {
                return res.status(404).json({ error: 'Image not found' });
            }
            
            res.json({ image });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Загрузить одно или несколько изображений
    async uploadImages(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const { title, description } = req.body;
            const uploadedImages = [];

            for (const file of req.files) {
                // Сохранение в БД
                const imageData = {
                    title: title || file.originalname,
                    description: description || '',
                    imageUrl: `/public/uploads/gallery/${file.filename}`,
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    user: req.user.id
                };

                // const savedImage = await Image.create(imageData);
                const savedImage = {
                    id: Date.now().toString(),
                    ...imageData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                uploadedImages.push(savedImage);
            }

            res.status(201).json({
                message: `Successfully uploaded ${uploadedImages.length} image(s)`,
                images: uploadedImages
            });
        } catch (error) {
            // Удаляем загруженные файлы в случае ошибки
            if (req.files) {
                req.files.forEach(file => {
                    require('../utils/upload').deleteFile(`/uploads/gallery/${file.filename}`)
                        .catch(console.error);
                });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // Обновить информацию об изображении
    async updateImage(req, res) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;

            // const image = await Image.findById(id);
            const image = {
                id,
                title: "Old Title",
                description: "Old Description",
                user: req.user.id
            };

            if (!image) {
                return res.status(404).json({ error: 'Image not found' });
            }

            // Проверяем, принадлежит ли изображение пользователю
            if (image.user.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Обновляем данные
            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            updateData.updatedAt = new Date();

            // const updatedImage = await Image.findByIdAndUpdate(id, updateData, { new: true });
            const updatedImage = {
                ...image,
                ...updateData
            };

            res.json({
                message: 'Image updated successfully',
                image: updatedImage
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Удалить изображение
    async deleteImage(req, res) {
        try {
            const { id } = req.params;

            // const image = await Image.findById(id);
            const image = {
                id,
                filename: "gallery-123456.jpg",
                user: req.user.id
            };

            if (!image) {
                return res.status(404).json({ error: 'Image not found' });
            }

            // Проверяем, принадлежит ли изображение пользователю
            if (image.user.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Удаляем файл с диска
            try {
                await require('../utils/upload').deleteFile(`/uploads/gallery/${image.filename}`);
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
                // Продолжаем удаление записи из БД даже если файл не найден
            }

            // Удаляем запись из БД
            // await Image.findByIdAndDelete(id);

            res.json({ 
                message: 'Image deleted successfully',
                deletedImage: image
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Поиск изображений
    async searchImages(req, res) {
        try {
            const { query } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;

            if (!query) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            // Поиск по заголовку и описанию
            // const images = await Image.find({
            //     $or: [
            //         { title: { $regex: query, $options: 'i' } },
            //         { description: { $regex: query, $options: 'i' } }
            //     ]
            // }).skip(skip).limit(limit);

            // const total = await Image.countDocuments({
            //     $or: [
            //         { title: { $regex: query, $options: 'i' } },
            //         { description: { $regex: query, $options: 'i' } }
            //     ]
            // });

            const images = [];
            const total = 0;

            res.json({
                images,
                query,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Получить изображения текущего пользователя
    async getMyImages(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;

            // const images = await Image.find({ user: req.user.id })
            //     .skip(skip)
            //     .limit(limit)
            //     .sort({ createdAt: -1 });

            // const total = await Image.countDocuments({ user: req.user.id });

            const images = [];
            const total = 0;

            res.json({
                images,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Получить количество изображений пользователя
    async getImageStats(req, res) {
        try {
            // const totalImages = await Image.countDocuments({ user: req.user.id });
            // const totalSize = await Image.aggregate([
            //     { $match: { user: req.user.id } },
            //     { $group: { _id: null, totalSize: { $sum: '$size' } } }
            // ]);

            const totalImages = 0;
            const totalSize = [{ totalSize: 0 }];

            res.json({
                totalImages,
                totalSize: totalSize[0]?.totalSize || 0
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = galleryController;