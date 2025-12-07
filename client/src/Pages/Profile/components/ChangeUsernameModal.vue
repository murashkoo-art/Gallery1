<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">Изменение логина</h3>
      
      <form @submit.prevent="handleSubmit" class="edit-form">
        <div class="form-group">
          <label for="currentUsername" class="form-label">Текущий логин:</label>
          <div class="current-value">{{ currentUsername }}</div>
        </div>
        
        <div class="form-group">
          <label for="newUsername" class="form-label">Новый логин:</label>
          <input
            id="newUsername"
            v-model="form.newUsername"
            type="text"
            class="form-input"
            placeholder="Введите новый логин"
            required
            minlength="3"
            maxlength="30"
          >
          <small class="form-hint">От 3 до 30 символов, только латнские буквы, цифры и _</small>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Текущий пароль:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Введите пароль для подтверждения"
            required
          >
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="success" class="success-message">
          {{ success }}
        </div>
        
        <div class="modal-actions">
          <button 
            type="submit" 
            class="save-button" 
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Изменение...' : 'Изменить логин' }}
          </button>
          <button 
            type="button" 
            @click="close" 
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
  name: 'ChangeUsernameModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    currentUsername: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        newUsername: '',
        password: ''
      },
      error: null,
      success: null,
      isSubmitting: false
    }
  },
  computed: {
    isFormValid() {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      return (
        this.form.newUsername &&
        this.form.password &&
        this.form.newUsername.length >= 3 &&
        this.form.newUsername.length <= 30 &&
        usernameRegex.test(this.form.newUsername) &&
        this.form.newUsername !== this.currentUsername
      );
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isFormValid) {
        this.error = 'Логин должен содержать от 3 до 30 символов (только буквы, цифры и _)';
        return;
      }
      
      if (this.form.newUsername === this.currentUsername) {
        this.error = 'Новый логин должен отличаться от текущего';
        return;
      }
      
      this.isSubmitting = true;
      this.error = null;
      this.success = null;
      
      try {
        await this.$emit('submit', {
          username: this.form.newUsername,
          password: this.form.password
        });
        
        this.success = 'Логин успешно изменен!';
        
        setTimeout(() => {
          this.close();
        }, 2000);
        
      } catch (error) {
        this.error = error.message || 'Ошибка при изменении логина';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      this.form = {
        newUsername: '',
        password: ''
      };
      this.error = null;
      this.success = null;
    },
    
    close() {
      this.resetForm();
      this.$emit('close');
    }
  },
  watch: {
    isOpen(newVal) {
      if (!newVal) {
        this.resetForm();
      }
    }
  },
  emits: ['close', 'submit']
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
  position: relative;
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

.current-value {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 10px;
  font-weight: 500;
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

.success-message {
  margin: 15px 0;
  padding: 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
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