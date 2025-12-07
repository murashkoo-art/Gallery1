<template>
  <div class="admin-users-page">
    <!-- Навигация -->
    <div class="admin-header">
      <router-link to="/profile" class="back-link">
        ← Назад к профилю
      </router-link>
      <h1>Управление пользователями</h1>
    </div>
    
    <div class="users-list">
      <div class="list-header">
        <h3>Все пользователи</h3>
        <button @click="loadUsers" class="load-users-button" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Обновить список' }}
        </button>
      </div>
      
      <!-- Сообщение о загрузке -->
      <div v-if="loading" class="loading-message">
        Загрузка пользователей...
      </div>
      
      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Список пользователей -->
      <div v-if="users.length" class="users-grid">
        <div v-for="user in users" :key="user.id" class="user-item">
          <div class="user-avatar">
            <img v-if="user.avatar" :src="user.avatar" alt="Аватар" />
            <div v-else class="avatar-placeholder">
              {{ getUserInitials(user) }}
            </div>
          </div>
          <div class="user-info">
            <strong class="user-name">
              {{ user.first_name || 'Не указано' }} {{ user.last_name || '' }}
            </strong>
            <span class="user-email">{{ user.email }}</span>
            <span class="user-role">{{ getUserRole(user) }}</span>
          </div>
          <div class="user-actions">
            <button class="action-btn edit-btn">Изменить</button>
            <button class="action-btn delete-btn">Удалить</button>
          </div>
        </div>
      </div>
      
      <!-- Сообщение если список пуст -->
      <div v-if="!loading && !error && users.length === 0" class="empty-message">
        Пользователи не найдены
      </div>
    </div>
  </div>
</template>

<script>
import api from '@api'

export default {
  name: 'ProfileUsersList',
  data() {
    return {
      users: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.getAllUsers(); // Исправлено: заменил apiService на api
        this.users = response.users || response.data || [];
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки пользователей';
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getUserInitials(user) {
      const first = user.first_name ? user.first_name[0].toUpperCase() : '';
      const last = user.last_name ? user.last_name[0].toUpperCase() : '';
      return first + last || '?';
    },
    
    getUserRole(user) {
      const roles = {
        1: 'Администратор',
        2: 'Пользователь',
        3: 'Куратор',
        4: 'Художник',
      };
      return roles[user.role_id] || user.role_name || user.role || 'Пользователь';
    }
  }
};
</script>

<style scoped>
/* Стили остаются без изменений */
.admin-users-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%);
  min-height: 100vh;
}

.admin-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #d4af37;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #a88b3a;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border: 1px solid #e6d8b5;
}

.back-link:hover {
  color: #8b6914;
  text-decoration: none;
  background: linear-gradient(135deg, #fff5d9 0%, #fff0cc 100%);
  border-color: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 8px;
  border: 1px solid #e6d8b5;
}

.load-users-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fffaf0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.load-users-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
}

.load-users-button:disabled {
  background: linear-gradient(135deg, #e6d8b5 0%, #d4c09b 100%);
  color: #a88b3a;
  cursor: not-allowed;
  box-shadow: none;
}

.users-grid {
  display: grid;
  gap: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 2px solid #e6d8b5;
  border-radius: 10px;
  background: linear-gradient(135deg, #fffdf6 0%, #fffaf0 100%);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
  border-color: #d4af37;
}

.user-avatar {
  margin-right: 1.25rem;
  flex-shrink: 0;
}

.user-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fffaf0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  border: 2px solid #e6d8b5;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  margin-bottom: 0.5rem;
  color: #8b6914;
  font-size: 1.1rem;
  font-weight: 600;
}

.user-email {
  display: block;
  color: #a88b3a;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.user-role {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b6914;
  border: 1px solid #e6d8b5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: #fffaf0;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #e6d8b5 0%, #d4c09b 100%);
  color: #8b6914;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #d4c09b 0%, #c9b388 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 139, 58, 0.3);
}

.loading-message,
.error-message,
.empty-message {
  padding: 2.5rem;
  text-align: center;
  border-radius: 10px;
  margin: 1rem 0;
  font-weight: 500;
}

.loading-message {
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  color: #a88b3a;
  border: 2px solid #e6d8b5;
}

.loading-message:before {
  content: "";
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e6d8b5;
  border-top: 3px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: linear-gradient(135deg, #ffe6e6 0%, #ffdbdb 100%);
  color: #c84e4e;
  border: 2px solid #e6b5b5;
}

.error-message:before {
  content: "!";
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #c84e4e 100%);
  color: white;
  border-radius: 50%;
  line-height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
}

.empty-message {
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  color: #a88b3a;
  border: 2px solid #e6d8b5;
}

.empty-message:before {
  content: "";
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #e6d8b5 0%, #d4c09b 100%);
  border-radius: 50%;
  position: relative;
}

.empty-message:after {
  content: "";
  position: absolute;
  width: 20px;
  height: 2px;
  background: #a88b3a;
  transform: rotate(45deg);
  margin-top: 19px;
  margin-left: -10px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-users-page {
    padding: 1.5rem 1rem;
  }
  
  .user-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .user-avatar {
    margin-right: 0;
  }
  
  .user-info {
    text-align: center;
  }
  
  .user-actions {
    width: 100%;
    justify-content: center;
  }
  
  .list-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>