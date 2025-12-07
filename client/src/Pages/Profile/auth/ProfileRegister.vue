<template>
  <div class="auth-section">
    <h3>Регистрация</h3>
    <p class="welcome-text">Создайте аккаунт в Golden Ratio</p>
    
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label>Email</label>
        <input 
          v-model="formData.email" 
          type="email" 
          placeholder="your@email.com" 
          required
          class="form-input"
          :class="{ 'error': errors.email }"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>
      
      <div class="form-group">
        <label>Пароль</label>
        <input 
          v-model="formData.password" 
          type="password" 
          placeholder="Введите пароль" 
          required
          class="form-input"
          :class="{ 'error': errors.password }"
        >
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>
      
      <div class="form-group">
        <label>Подтвердите пароль</label>
        <input 
          v-model="formData.confirmPassword" 
          type="password" 
          placeholder="Повторите пароль" 
          required
          class="form-input"
          :class="{ 'error': errors.confirmPassword }"
        >
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <div class="form-group">
        <label>Имя</label>
        <input 
          v-model="formData.firstName" 
          type="text" 
          placeholder="Введите ваше имя" 
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label>Фамилия</label>
        <input 
          v-model="formData.lastName" 
          type="text" 
          placeholder="Введите вашу фамилию" 
          class="form-input"
        >
      </div>
      
      <button type="submit" class="auth-button" :disabled="loading">
        {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
      
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </form>
    
    <div class="auth-switch">
      Уже есть аккаунт? 
      <a href="#" @click.prevent="$emit('switch-to-login')" class="switch-link">Войти</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileRegister',
  props: {
    loading: Boolean
  },
  data() {
    return {
      formData: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      },
      errors: {},
      message: '',
      messageType: 'success'
    };
  },
  methods: {
    handleSubmit() {
      if (this.validateForm()) {
        this.$emit('register', { ...this.formData });
      }
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.formData.email) {
        this.errors.email = 'Email обязателен';
        isValid = false;
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = 'Введите корректный email';
        isValid = false;
      }

      if (!this.formData.password) {
        this.errors.password = 'Пароль обязателен';
        isValid = false;
      } else if (this.formData.password.length < 6) {
        this.errors.password = 'Пароль должен содержать минимум 6 символов';
        isValid = false;
      }

      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = 'Подтверждение пароля обязательно';
        isValid = false;
      } else if (this.formData.password !== this.formData.confirmPassword) {
        this.errors.confirmPassword = 'Пароли не совпадают';
        isValid = false;
      }

      return isValid;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
};
</script>

<style scoped>
/* Стили из оригинального компонента */
.auth-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}

.welcome-text {
  text-align: center;
  color: #666;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.auth-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.auth-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.auth-switch {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.switch-link {
  color: #3498db;
  text-decoration: none;
  margin-left: 0.5rem;
}

.switch-link:hover {
  text-decoration: underline;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>