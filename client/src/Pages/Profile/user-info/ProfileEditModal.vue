<template>
  <div v-if="isEditing" class="modal-overlay" @click="cancelEditing">
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">Редактирование профиля</h3>
      
      <form @submit.prevent="saveChanges" class="edit-form">
        <!-- ТОЛЬКО поля, которые можно редактировать здесь -->
        <div class="form-group">
          <label for="first_name" class="form-label">Имя:</label>
          <input
            id="first_name"
            v-model="editedUser.first_name"
            type="text"
            class="form-input"
            placeholder="Введите имя"
          >
        </div>
        
        <div class="form-group">
          <label for="last_name" class="form-label">Фамилия:</label>
          <input
            id="last_name"
            v-model="editedUser.last_name"
            type="text"
            class="form-input"
            placeholder="Введите фамилию"
          >
        </div>
        
        <div class="form-group">
          <label for="phone" class="form-label">Телефон:</label>
          <input
            id="phone"
            v-model="editedUser.phone"
            type="tel"
            class="form-input"
            placeholder="+7 (999) 123-45-67"
          >
        </div>
        
        <div class="info-note">
          <p><strong>Примечание:</strong></p>
          <ul>
            <li>Логин, Email и Пароль изменяется отдельно через "Безопасность"</li>
          </ul>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="modal-actions">
          <button 
            type="submit" 
            class="save-button" 
            :disabled="isSaving || !hasChanges"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <button 
            type="button" 
            @click="cancelEditing" 
            class="cancel-button"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileEditModal',
  props: {
    isEditing: {
      type: Boolean,
      default: false
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      required: true
    },
    editedUser: {
      type: Object,
      required: true
    },
    hasChanges: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      error: null
    }
  },
  methods: {
    saveChanges() {
      if (!this.hasChanges) {
        this.$emit('cancel-editing');
        return;
      }
      
      // Проверяем, что не пытаемся изменить запрещенные поля
      const updateData = {
        first_name: this.editedUser.first_name,
        last_name: this.editedUser.last_name,
        phone: this.editedUser.phone
      };
      
      this.$emit('save-changes', updateData);
    },
    
    cancelEditing() {
      this.error = null;
      this.$emit('cancel-editing');
    }
  },
  emits: ['save-changes', 'cancel-editing']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid #d4af37;
}

.modal-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  color: #8b6914;
  text-align: center;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 0.8rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #8b6914;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.7rem;
  border: 1px solid #d4af37;
  border-radius: 4px;
  background: #fffbf0;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #b8860b;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.2);
  background: white;
}

.info-note {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin: 1rem 0;
}

.info-note p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.info-note ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.2rem;
}

.info-note li {
  margin-bottom: 0.3rem;
}

.error-message {
  margin: 15px 0;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.save-button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 100px;
}

.save-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #b8860b, #8b6914);
  transform: translateY(-1px);
}

.save-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  padding: 0.7rem 1.5rem;
  border: 1px solid #8b4513;
  background: white;
  color: #8b4513;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 100px;
}

.cancel-button:hover {
  background: #8b4513;
  color: white;
}
</style>