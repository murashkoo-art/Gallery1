<!-- D:\dev\proj\art_gallery\client\src\Pages\Profile\user-info\ProfileInfoPanel.vue -->
<template>
  <div class="center-column">
    <div class="info-panel">
      <h3 class="panel-title">Основная информация</h3>
      
      <div class="user-details">
        <!-- Имя пользователя - только для чтения -->
        <div class="detail-row">
          <span class="detail-label">Логин:</span>
          <span class="detail-value">
            {{ user.username }}
          </span>
        </div>
        
        <ProfileDetailRow 
          label="Имя:" 
          :value="user.first_name" 
        />
        
        <ProfileDetailRow 
          label="Фамилия:" 
          :value="user.last_name" 
        />
        
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value email-with-status">
            {{ user.email }}
          </span>
        </div>
        
        <ProfileDetailRow 
          label="Телефон:" 
          :value="user.phone" 
        />
        
        <div class="detail-row">
          <span class="detail-label">Роль в системе:</span>
          <span class="detail-value">
            {{ userRoleName }}
          </span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Дата регистрации:</span>
          <span class="detail-value" :class="{ 'empty-field': !user.created_at }">
            {{ formatDate(user.created_at) || 'Не указана' }}
          </span>
        </div>
      </div>
      
      <!-- Кнопка запроса доступа -->
      <AccessRequestButton 
        v-if="showAccessRequestButton"
        :user="user"
        @request-submitted="handleRequestSubmitted"
        class="access-request-button"
      />
      
      <button class="edit-button-primary" @click="$emit('edit-profile')">
        Редактировать профиль
      </button>
    </div>
  </div>
</template>

<script>
import ProfileDetailRow from './ProfileDetailRow.vue'
import AccessRequestButton from '../components/AccessRequestButton.vue'

export default {
  name: 'ProfileInfoPanel',
  components: {
    ProfileDetailRow,
    AccessRequestButton
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    userRoleName() {
      const roles = {
        1: 'Администратор',
        2: 'Пользователь',
        3: 'Куратор',
        4: 'Художник',
      };
      return roles[this.user.role_id] || this.user.role_name || 'Пользователь';
    },
    
    showAccessRequestButton() {
      // Показывать кнопку только обычным пользователям
      return this.user.role_id === 2;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('ru-RU');
      } catch (error) {
        return 'Неверная дата';
      }
    },
    
    handleRequestSubmitted(request) {
      // Обработка успешной отправки заявки
      console.log('Access request submitted:', request);
      this.$emit('access-requested', request);
    }
  },
  emits: ['edit-profile', 'access-requested']
}
</script>

<style scoped>
.center-column {
  flex: 1;
  max-width: 380px;
  min-width: 300px;
  margin-right: 0.5rem;
}

.info-panel {
  background: #fffbf0;
  padding: 1.2rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.1);
  border: 1px solid #f1e8d0;
  margin: 0 0 1rem 0;
}

.panel-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #8b6914;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 0.4rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #f1e8d0;
  font-size: 0.85rem;
  align-items: center;
}

.detail-label {
  flex: 0 0 120px;
  font-weight: 500;
  color: #b8860b;
}

.detail-value {
  flex: 1;
  color: #5d4c1d;
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-with-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verification-status {
  font-size: 0.8rem;
}

.verification-status.verified {
  color: #28a745;
}

.verification-status.not-verified {
  color: #dc3545;
}

.edit-note {
  font-size: 0.75rem;
  color: #666;
  font-style: italic;
}

.empty-field {
  color: #cdb87d;
  font-style: italic;
}

/* Кнопка запроса доступа */
.access-request-button {
  margin-bottom: 10px;
  width: 100%;
}

/* Основная кнопка редактирования профиля */
.edit-button-primary {
  width: 100%;
  padding: 0.6rem;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.edit-button-primary:hover {
  background: linear-gradient(135deg, #b8860b, #8b6914);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(184, 134, 11, 0.3);
}

@media (max-width: 1024px) {
  .center-column {
    max-width: 340px;
    min-width: 260px;
  }
}

@media (max-width: 768px) {
  .center-column {
    flex: none;
    width: 100%;
    max-width: none;
    min-width: auto;
  }
}
</style>