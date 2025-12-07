// server/controllers/artworkController.js
const artworkController = {
    // Получить все картины (упрощенная версия)
    async getAllArtworks(req, res) {
        try {
            console.log('Getting artworks...');
            
            // Простая проверка - возвращаем пустой массив если нет БД
            res.json({
                artworks: [],
                pagination: {
                    current: 1,
                    totalPages: 0,
                    totalItems: 0,
                    limit: 12
                }
            });
            
        } catch (error) {
            console.error('Error in getAllArtworks:', error);
            res.status(500).json({ 
                error: 'Ошибка при получении картин',
                details: error.message 
            });
        }
    },

    // Получить картину по ID
    async getArtworkById(req, res) {
        try {
            const { id } = req.params;
            res.json({ 
                artwork: { 
                    id, 
                    title: 'Пример картины',
                    description: 'Описание картины'
                } 
            });
            
        } catch (error) {
            console.error('Error getting artwork:', error);
            res.status(500).json({ error: 'Ошибка при получении картины' });
        }
    },

    // Создать новую картину
    async createArtwork(req, res) {
        try {
            const { title, description, year, style, price } = req.body;
            const userId = req.user.id;
            
            if (!title) {
                return res.status(400).json({ error: 'Название обязательно' });
            }
            
            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/artworks/${req.file.filename}`;
            }
            
            const artwork = {
                id: Date.now(),
                title,
                description,
                artist_id: userId,
                year: year ? parseInt(year) : null,
                style,
                price: price ? parseFloat(price) : null,
                image_url: imageUrl,
                created_at: new Date().toISOString()
            };
            
            res.status(201).json({ 
                message: 'Картина успешно создана',
                artwork 
            });
            
        } catch (error) {
            console.error('Error creating artwork:', error);
            res.status(500).json({ error: 'Ошибка при создании картины' });
        }
    },

    // Получить уникальные стили
    async getArtworkStyles(req, res) {
        try {
            res.json({ 
                styles: ['Ренессанс', 'Импрессионизм', 'Экспрессионизм'] 
            });
            
        } catch (error) {
            console.error('Error getting styles:', error);
            res.status(500).json({ error: 'Ошибка при получении стилей' });
        }
    },

    // Получить уникальные годы
    async getArtworkYears(req, res) {
        try {
            res.json({ 
                years: [2020, 2021, 2022, 2023, 2024] 
            });
            
        } catch (error) {
            console.error('Error getting years:', error);
            res.status(500).json({ error: 'Ошибка при получении годов' });
        }
    },

    // Остальные методы пока оставим пустыми
    async updateArtwork(req, res) {
        try {
            res.json({ message: 'Картина обновлена' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteArtwork(req, res) {
        try {
            res.json({ message: 'Картина удалена' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getArtworksByArtist(req, res) {
        try {
            res.json({ artworks: [] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getMyArtworks(req, res) {
        try {
            res.json({ artworks: [] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = artworkController;