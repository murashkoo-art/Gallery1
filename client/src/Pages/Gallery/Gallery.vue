
<template>
  <div class="gallery-module">
    <!-- Проверка авторизации -->
    <div v-if="!currentUser" class="guest-view">
      <div class="guest-content">
        <h2>Требуется авторизация</h2>
        <p>Для просмотра галереи необходимо войти в систему</p>
        <div class="guest-actions">
          <router-link to="/profile" class="btn-primary">
            Войти / Зарегистрироваться
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Если пользователь авторизован -->
    <div v-else>
      <div class="gallery-header">
      <h1>Галерея</h1>
    
       <div class="header-controls">
        <!-- Подключаемый компонент фильтров -->
        <GalleryFilters 
          :initialFilters="initialFilters"
          @filters-changed="handleFiltersChanged"
        />
        
        <!-- Кнопка загрузки изображений -->
         <GoldenButton 
              text="Загрузить изображения" 
              variant="primary"
              @click=""
            >
            <UploadIcon />
         </GoldenButton>
      </div>
    
      <!-- Попап загрузки (пример структуры) -->
      <UploadPopup 
        v-if="showUploadPopup" 
        @close="closeUploadPopup"
        @upload-complete="handleUploadComplete"
      />
    </div>

      <!-- Основное содержимое галереи -->
      <div class="gallery-content">
        <div v-if="loading" class="loading">Загрузка галереи...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
          <!-- Простой вариант без фильтров -->
          <div v-if="items.length === 0" class="empty">Картин пока нет</div>
          <div v-else class="gallery-grid">
            <div 
              v-for="item in items" 
              :key="item.id"
              class="gallery-item"
            >
              <img :src="getImageUrl(item.image)" :alt="item.title" />
              <div class="item-info">
                <h3>{{ item.title }}</h3>
                <p class="artist">{{ item.artist }}</p>
                <p class="year">{{ item.year }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GoldenButton from '@/components/Button.vue'
import GalleryFilters from './GalleryFilters.vue'
import UploadIcon from '@/icons/UploadIcon.vue'

// Реактивные переменные
const loading = ref(false)
const error = ref(null)
const items = ref([])
const currentUser = ref(null)
const activeFilters = ref({
  artist: null,
  style: null,
  year: null
})

// Вычисляемое свойство
const filteredItems = computed(() => {
  let filtered = [...items.value]
  
  if (activeFilters.value.artist) {
    filtered = filtered.filter(item => 
      item.artist_id == activeFilters.value.artist || 
      item.artistId == activeFilters.value.artist
    )
  }
  
  if (activeFilters.value.style) {
    filtered = filtered.filter(item => 
      item.style === activeFilters.value.style
    )
  }
  
  if (activeFilters.value.year) {
    filtered = filtered.filter(item => 
      item.year == activeFilters.value.year
    )
  }
  
  return filtered
})

// Методы
const checkAuth = () => {
  try {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  } catch (error) {
    console.error('Error checking auth:', error)
    currentUser.value = null
  }
}

const handleFiltersChanged = (filters) => {
  activeFilters.value = filters
  console.log('Фильтры изменены:', filters)
}

const loadGallery = async () => {
  if (!currentUser.value) return
  
  try {
    loading.value = true
    error.value = null
    
    console.log('Loading gallery...', {
      user: currentUser.value.email,
      token: currentUser.value.token ? 'present' : 'missing'
    })
    
    const token = currentUser.value.token
    const response = await fetch('http://localhost:3000/api/artworks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const text = await response.text()
      console.error('Error response:', text)
      throw new Error(`Ошибка сервера: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Response data:', data)
    
    items.value = data.artworks || []
    
    if (items.value.length === 0) {
      error.value = 'В галерее пока нет картин'
    }
    
  } catch (err) {
    console.error('Ошибка загрузки галереи:', err)
    error.value = err.message || 'Не удалось загрузить галерею'
    items.value = []
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (filters) => {
  activeFilters.value = { ...filters }
}

const getImageUrl = (imagePath) => {
  if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('//')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    return `http://localhost:3000${cleanPath}`
  }
  return imagePath
}

const getRoleName = (role) => {
  const roles = {
    'admin': 'Администратор',
    'user': 'Пользователь',
    'artist': 'Художник',
    'curator': 'Куратор'
  }
  return roles[role] || role || 'Гость'
}

// Обработчик события storage
const handleStorageChange = (event) => {
  if (event.key === 'currentUser') {
    checkAuth()
    if (currentUser.value) {
      loadGallery()
    }
  }
}

// Хуки жизненного цикла
onMounted(() => {
  checkAuth()
  loadGallery()
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
/* Основной контейнер */
.gallery-module {
  margin: 0;
  padding: 2rem 1rem;
  width: auto;
  max-width: none;
  min-height: 100vh;
  background: linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%);
}

/* Стили для гостей */
.guest-view {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #fffaf0 0%, #fef9f3 100%);
}

.guest-content {
  text-align: center;
  padding: 3rem 2rem;
  border: 2px solid #d4af37;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15);
}

.guest-content h2 {
  margin: 0 0 1.5rem 0;
  color: #8b6914;
  font-size: 1.8rem;
  font-weight: 600;
}

.guest-content p {
  margin: 0 0 2.5rem 0;
  color: #a88b3a;
  font-size: 1.1rem;
  line-height: 1.6;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fff;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* Шапка для авторизованных */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 12px;
  border: 1px solid #e6d8b5;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
}

.gallery-header h1 {
  margin: 0;
  color: #8b6914;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4af37 0%, #a88b3a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.user-info span {
  color: #000000;
  font-size: 1rem;
}

.user-info strong {
  color: #000000;
  font-weight: 600;
}

.user-role {
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

/* Сетка картин */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.gallery-item {
  border: 1px solid #e6d8b5;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.08);
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
}

.gallery-item img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.item-info {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fffaf0 100%);
}

.item-info h3 {
  margin: 0 0 0.75rem 0;
  color: #8b6914;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.4;
}

.artist {
  color: #d4af37;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year {
  color: #a88b3a;
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Состояния */
.loading, .error, .empty {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 12px;
  border: 1px solid #e6d8b5;
}

.loading {
  color: #a88b3a;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading:before {
  content: "";
  width: 50px;
  height: 50px;
  border: 4px solid #e6d8b5;
  border-top: 4px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #c84e4e;
  background: linear-gradient(135deg, #ffe6e6 0%, #ffdbdb 100%);
  border-color: #e6b5b5;
  font-size: 1.2rem;
}

.error:before {
  content: "⚠️ ";
  font-size: 1.5em;
  margin-right: 0.5rem;
}

.empty {
  color: #a88b3a;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  font-size: 1.2rem;
}

/* Декоративные элементы */
.gallery-module:before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4af37 0%, #c19b2e 50%, #d4af37 100%);
  z-index: 1000;
}

/* Адаптивность */
@media (max-width: 768px) {
  .gallery-module {
    padding: 1.5rem 0.75rem;
  }
  
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .user-info {
    align-items: flex-start;
  }
  
  .gallery-header h1 {
    font-size: 1.8rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
  }
  
  .guest-content {
    padding: 2rem 1.5rem;
  }
  
  .btn-primary {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .gallery-item {
    max-width: 100%;
  }
}
</style>