<!-- client/src/Pages/Gallery/components/ArtworkGrid.vue -->
<template>
  <div class="artwork-grid">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="artwork-card"
    >
      <div class="artwork-image">
        <img 
          :src="getImageUrl(item.image_url || item.image || item.file_path || item.image_path)" 
          :alt="item.title"
          @error="handleImageError"
          loading="lazy"
        />
        <div class="artwork-overlay">
          <button class="view-btn" @click="$emit('view', item)">
            Подробнее
          </button>
        </div>
      </div>
      <div class="artwork-info">
        <h3>{{ item.title }}</h3>
        <p class="artist">{{ item.artist_name || item.artist || item.creator || 'Неизвестный художник' }}</p>
        <div class="details">
          <span class="year" v-if="item.year">{{ item.year }} год</span>
          <span class="style" v-if="item.style">{{ item.style }}</span>
        </div>
        <p class="description" v-if="item.description">
          {{ truncateDescription(item.description) }}
        </p>
        <div class="artwork-meta">
          <span class="date" v-if="item.created_at">
            {{ formatDate(item.created_at) }}
          </span>
          <span class="price" v-if="item.price">
            {{ formatPrice(item.price) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArtworkGrid',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view'],
  methods: {
    getImageUrl(imagePath) {
      // Если изображение уже имеет полный URL, используем его
      if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('//'))) {
        return imagePath
      }
      
      // Если путь относительный, добавляем базовый URL API
      if (imagePath) {
        // Убеждаемся, что путь начинается со слеша
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return `http://localhost:3000${cleanPath}`
      }
      
      // Если изображение отсутствует, показываем placeholder с названием
      const title = this.items[0]?.title || 'Картина'
      return `https://placehold.co/300x200/d4af37/ffffff?text=${encodeURIComponent(title)}`
    },
    
    handleImageError(event) {
      // При ошибке загрузки изображения показываем заглушку
      const title = event.target.alt || 'Картина'
      event.target.src = `https://placehold.co/300x200/d4af37/ffffff?text=${encodeURIComponent(title)}`
    },
    
    truncateDescription(description, maxLength = 100) {
      if (!description) return ''
      if (description.length <= maxLength) return description
      return description.substring(0, maxLength) + '...'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU')
      } catch (e) {
        return dateString
      }
    },
    
    formatPrice(price) {
      if (!price) return ''
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(price)
    }
  }
}
</script>

<style scoped>
.artwork-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.artwork-card {
  border: 2px solid #e6d8b5;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #fffdf6 0%, #fffaf0 100%);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.08);
}

.artwork-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
}

.artwork-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
}

.artwork-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artwork-card:hover .artwork-image img {
  transform: scale(1.05);
}

.artwork-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(212, 175, 55, 0.1) 0%, 
    rgba(193, 155, 46, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  backdrop-filter: blur(2px);
}

.artwork-card:hover .artwork-overlay {
  opacity: 1;
}

.view-btn {
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fffaf0;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  text-transform: uppercase;
}

.view-btn:hover {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
}

.artwork-info {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fffaf0 100%);
}

.artwork-info h3 {
  margin: 0 0 0.75rem 0;
  color: #8b6914;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.4;
  border-bottom: 1px solid #e6d8b5;
  padding-bottom: 0.75rem;
}

.artist {
  color: #a88b3a;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.artist:before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.details {
  color: #8b6914;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 4px;
  border: 1px solid #e6d8b5;
}

.details:before {
  content: "";
  display: inline-block;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  border-radius: 2px;
  margin-right: 0.5rem;
}

.description {
  color: #5a4a1a;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 1rem 0 0 0;
  padding: 1rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 6px;
  border-left: 3px solid #d4af37;
  font-style: italic;
}

/* Декоративные детали */
.artwork-card:after {
  content: "";
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
}

.artwork-image:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #d4af37 50%, 
    transparent 100%);
  z-index: 2;
}

/* Адаптивность */
@media (max-width: 768px) {
  .artwork-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
  }
  
  .artwork-image {
    height: 200px;
  }
  
  .artwork-info {
    padding: 1.25rem;
  }
  
  .artwork-info h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .artwork-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>