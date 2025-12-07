<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Запрос повышенного доступа</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Всегда показываем форму -->
        <div class="request-form">
          <div class="form-group">
            <label for="requestedRole" class="form-label">
              Выберите желаемую роль:
            </label>
            <select 
              id="requestedRole" 
              v-model="form.requestedRole" 
              class="form-select"
              :class="{ 'is-invalid': errors.requestedRole }"
            >
              <option value="">-- Выберите роль --</option>
              <option value="artist">Художник</option>
              <option value="curator">Куратор выставок</option>
            </select>
            <div v-if="errors.requestedRole" class="invalid-feedback">
              {{ errors.requestedRole }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="message" class="form-label">
              Сообщение администратору (необязательно):
            </label>
            <textarea 
              id="message" 
              v-model="form.message" 
              class="form-textarea" 
              rows="4"
              placeholder="Расскажите о своем опыте, причинах запроса..."
            ></textarea>
            <div class="form-hint">
              Это сообщение поможет администратору принять решение
            </div>
          </div>
          
          <div v-if="form.requestedRole" class="role-permissions">
            <h5 class="permissions-title">Права {{ formatRole(form.requestedRole) }}а:</h5>
            <ul class="permissions-list">
              <li v-if="form.requestedRole === 'artist'">
                • Создание и управление собственными картинами
              </li>
              <li v-if="form.requestedRole === 'artist'">
                • Просмотр выставок и участие в них
              </li>
              <li v-if="form.requestedRole === 'artist'">
                • Загрузка изображений своих работ
              </li>
              <li v-if="form.requestedRole === 'curator'">
                • Создание и управление выставками
              </li>
              <li v-if="form.requestedRole === 'curator'">
                • Управление художниками и картинами в выставках
              </li>
              <li v-if="form.requestedRole === 'curator'">
                • Просмотр отчетов и управление бронированиями
              </li>
            </ul>
          </div>
          
          <div class="modal-actions">
            <button 
              class="btn-secondary" 
              @click="closeModal"
              :disabled="submitting"
            >
              Отмена
            </button>
            <button 
              class="btn-primary" 
              @click="submitRequest"
              :disabled="submitting || !form.requestedRole"
            >
              <span v-if="submitting">Отправка...</span>
              <span v-else>Отправить запрос</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@api'

export default {
  name: 'RequestAccessModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      form: {
        requestedRole: '',
        message: ''
      },
      errors: {},
      submitting: false
    }
  },
  methods: {
    async submitRequest() {
      if (!this.validateForm()) return;
      
      this.submitting = true;
      
      try {
        const response = await api.post('/access/requests', {
          requestedRole: this.form.requestedRole,
          message: this.form.message || null
        });
        
        this.$emit('request-submitted', response.data.request);
        this.closeModal();
        
        if (this.$notify) {
          this.$notify({
            title: 'Заявка отправлена',
            text: 'Ваша заявка на повышенный доступ успешно отправлена администратору',
            type: 'success'
          });
        } else {
          alert('Заявка успешно отправлена!');
        }
        
      } catch (error) {
        console.error('Error submitting request:', error);
        
        if (error.response?.status === 400) {
          if (error.response.data?.error) {
            alert(error.response.data.error);
          }
        } else {
          alert('Не удалось отправить заявку. Попробуйте позже.');
        }
      } finally {
        this.submitting = false;
      }
    },
    
    validateForm() {
      this.errors = {};
      let isValid = true;
      
      if (!this.form.requestedRole) {
        this.errors.requestedRole = 'Пожалуйста, выберите роль';
        isValid = false;
      }
      
      return isValid;
    },
    
    formatRole(role) {
      const roles = {
        'artist': 'Художник',
        'curator': 'Куратор'
      };
      return roles[role] || role;
    },
    
    closeModal() {
      if (!this.submitting) {
        this.$emit('close');
      }
    }
  }
}
</script>