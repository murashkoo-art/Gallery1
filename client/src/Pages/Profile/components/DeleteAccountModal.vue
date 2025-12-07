<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">Удаление аккаунта</h3>
      
      <div class="warning-message">
        <strong>⚠️ Внимание! Это действие необратимо.</strong>
        <p>Все ваши данные, включая профиль, настройки и историю, будут удалены навсегда.</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="edit-form">
        <div class="form-group">
          <label for="email" class="form-label">Для подтверждения введите ваш email:</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :placeholder="currentEmail"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Введите ваш пароль:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Введите пароль"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="confirmation" class="form-label">
            Введите "УДАЛИТЬ" для подтверждения:
          </label>
          <input
            id="confirmation"
            v-model="form.confirmation"
            type="text"
            class="form-input"
            placeholder='Введите "УДАЛИТЬ"'
            required
          >
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="modal-actions">
          <button 
            type="submit" 
            class="delete-button" 
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Удаление...' : 'Удалить аккаунт' }}
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
  name: 'DeleteAccountModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    currentEmail: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmation: ''
      },
      error: null,
      isSubmitting: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.email &&
        this.form.password &&
        this.form.confirmation === 'УДАЛИТЬ' &&
        this.form.email === this.currentEmail
      );
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isFormValid) {
        this.error = 'Пожалуйста, заполните все поля правильно';
        return;
      }
      
      if (this.form.email !== this.currentEmail) {
        this.error = 'Введенный email не совпадает с вашим email';
        return;
      }
      
      if (this.form.confirmation !== 'УДАЛИТЬ') {
        this.error = 'Введите "УДАЛИТЬ" для подтверждения';
        return;
      }
      
      this.isSubmitting = true;
      this.error = null;
      
      try {
        await this.$emit('submit', {
          email: this.form.email,
          password: this.form.password
        });
        
      } catch (error) {
        this.error = error.message || 'Ошибка при удалении аккаунта';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      this.form = {
        email: '',
        password: '',
        confirmation: ''
      };
      this.error = null;
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

.warning-message {
  margin: 1rem 0;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9rem;
}

.warning-message strong {
  display: block;
  margin-bottom: 0.5rem;
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

.delete-button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 120px;
}

.delete-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-1px);
}

.delete-button:disabled {
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

/* Стили кнопки удаления в профиле */
.delete-account-button {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dc3545;
  background: #fff;
  color: #dc3545;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  margin-top: 0.8rem;
  transition: all 0.3s ease;
}

.delete-account-button:hover {
  background: #dc3545;
  color: white;
}

.delete-account-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>