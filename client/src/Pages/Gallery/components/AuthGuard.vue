<template>
  <div v-if="isLoading" class="auth-loading">
    <div class="spinner"></div>
    <p>Проверка доступа...</p>
  </div>
  <div v-else-if="!isAuthenticated" class="guest-view">
    <div class="guest-content">
      <h2>Доступ к галерее</h2>
      <p class="guest-message">
        Для просмотра произведений искусства необходимо авторизоваться в системе.
      </p>
      <div class="guest-actions">
        <router-link to="/profile" class="btn-primary">
          <span>Войти или зарегистрироваться</span>
        </router-link>
        <p class="guest-hint">
          Уже есть аккаунт? Авторизуйтесь в профиле
        </p>
      </div>
    </div>
  </div>
  <div v-else class="authorized-content">
    <slot/>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useGalleryAuth } from '../composables/useGalleryAuth'

const { isAuthenticated: authStatus, isLoading } = useGalleryAuth()

// Добавляем реактивность
const localAuth = ref(authStatus.value)
const localLoading = ref(isLoading.value)

// Обновляем значения при изменении
onMounted(() => {
  const updateValues = () => {
    localAuth.value = authStatus.value
    localLoading.value = isLoading.value
  }
  
  updateValues()
  
  // Обновляем при изменении localStorage (другие вкладки)
  window.addEventListener('storage', updateValues)
})
</script>

<style scoped>
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e6d8b5;
  border-top: 4px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.guest-view {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #fff9e6 0%, #f5eedd 100%);
}

.guest-content {
  background: linear-gradient(135deg, #fffdf6 0%, #fffaf0 100%);
  border-radius: 16px;
  padding: 3.5rem 3rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 15px 35px rgba(212, 175, 55, 0.15);
  text-align: center;
  border: 2px solid #d4af37;
  position: relative;
  overflow: hidden;
}

.guest-content:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4af37 0%, #c19b2e 50%, #d4af37 100%);
}

.guest-content h2 {
  color: #8b6914;
  margin-bottom: 1.25rem;
  font-size: 1.9rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(139, 105, 20, 0.1);
}

.guest-message {
  color: #a88b3a;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  font-size: 1.15rem;
  padding: 0 1rem;
}

.guest-actions {
  margin-top: 2.5rem;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fff;
  padding: 1.1rem 2.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.15rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
  position: relative;
  overflow: hidden;
  min-width: 220px;
}

.btn-primary:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.35);
}

.btn-primary:hover:before {
  left: 100%;
}

.guest-hint {
  margin-top: 1.5rem;
  color: #b8a15c;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0 1.5rem;
}

.auth-loading p {
  color: #a88b3a;
  font-size: 1.1rem;
  margin-top: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .guest-content {
    padding: 2.5rem 1.5rem;
    margin: 0 1rem;
  }
  
  .guest-content h2 {
    font-size: 1.7rem;
  }
  
  .guest-message {
    font-size: 1.05rem;
    padding: 0;
  }
  
  .btn-primary {
    padding: 1rem 2rem;
    font-size: 1.05rem;
    min-width: 200px;
  }
  
  .guest-view {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .guest-content {
    padding: 2rem 1.25rem;
  }
  
  .guest-content h2 {
    font-size: 1.5rem;
  }
  
  .guest-message {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .btn-primary {
    width: 100%;
    max-width: 280px;
  }
}
</style>