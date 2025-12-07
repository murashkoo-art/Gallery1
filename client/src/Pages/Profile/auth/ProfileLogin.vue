<template>
  <div class="auth-section">
    <div class="auth-header">
      <div class="logo-container">
        <div class="logo-icon">Φ</div>
        <h1 class="logo-text">Golden Ratio</h1>
      </div>
      <h3 class="auth-title">Вход в систему</h3>
      <p class="welcome-text">Добро пожаловать в мир искусства</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <div class="input-container">
          <input 
            v-model="formData.email" 
            type="email"
            autocomplete="email" 
            placeholder=" "
            required
            class="form-input"
          >
          <label class="floating-label">Email</label>
          <div class="input-icon">✉️</div>
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-container">
          <input 
            v-model="formData.password" 
            type="password"
            autocomplete="current-password" 
            placeholder=" "
            required
            class="form-input"
          >
          <label class="floating-label">Пароль</label>
          <div class="input-icon">🔒</div>
        </div>
      </div>
      
      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="formData.rememberMe">
          <span class="custom-checkbox"></span>
          <span class="checkbox-text">Запомнить меня</span>
        </label>
        <a href="#" class="forgot-password">
          Забыли пароль?
        </a>
      </div>
      
      <GoldenButton 
        type="submit"
        :text="loading ? 'Вход...' : 'Войти →'"
        variant="primary"
        class="auth-button"
        :disabled="loading" 
      />
    </form>
    
    <div class="auth-footer">
      <div class="auth-switch">
        Нет аккаунта? 
        <a href="#" @click.prevent="$emit('switch-to-register')" class="switch-link">
          Зарегистрироваться
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import GoldenButton from '@/components/Button.vue'

export default {
  name: 'ProfileLogin',
  components: {
    GoldenButton
  },
  props: {
    loading: Boolean
  },
  data() {
    return {
      formData: {
        email: '',
        password: '',
        rememberMe: false
      }
    };
  },
  methods: {
    handleSubmit() {
      // Более надежная проверка
      if (!this.formData.email.trim() || !this.formData.password.trim()) {
        console.error('Заполните все обязательные поля');
        return;
      }
      
      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        console.error('Введите корректный email');
        return;
      }
      
      this.$emit('login', { ...this.formData });
    }
  }
};
</script>


<style scoped>
.auth-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 248, 0.95) 100%);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  max-width: 440px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.auth-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 300;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 1px;
}

.auth-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-text {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 0;
  font-size: 0.95rem;
  font-weight: 400;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1.25rem 1rem 1.25rem 3rem;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  color: #2c3e50;
}

.form-input:focus {
  border-color: #d4af37;
  background: white;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
  transform: translateY(-2px);
}

.form-input:not(:placeholder-shown) {
  background: white;
}

.input-container:hover .form-input {
  border-color: #d4af37;
  background: white;
  transform: translateY(-2px);
}

.floating-label {
  position: absolute;
  left: 3rem;
  top: 8px;
  transform: translateY(0);
  color: #95a5a6;
  font-size: 0.75rem;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  padding: 0 6px;
  z-index: 2;
  font-weight: 500;
}


.form-input:focus + .floating-label,
.form-input:not(:placeholder-shown) + .floating-label,
.input-container:hover .floating-label {
  top: -15px; 
  font-size: 0.65rem; 
  color: #d4af37;
  background: linear-gradient(to bottom, white 50%, transparent 50%);
  font-weight: 600;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #bdc3c7;
  transition: color 0.3s ease;
  z-index: 3;
}

.form-input:focus ~ .input-icon,
.input-container:hover .input-icon {
  color: #d4af37;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  color: #7f8c8d;
  transition: color 0.3s ease;
  margin: 0;
  flex-shrink: 0;
}

.checkbox-label:hover {
  color: #2c3e50;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
  flex-shrink: 0;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .custom-checkbox {
  background: #d4af37;
  border-color: #d4af37;
}

input[type="checkbox"]:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-weight: 500;
  white-space: nowrap;
}

.forgot-password {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
}

.forgot-password::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #d4af37;
  transition: width 0.3s ease;
}

.forgot-password:hover {
  color: #d4af37;
}

.forgot-password:hover::after {
  width: 100%;
}

.auth-button {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(184, 134, 11, 0.3);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(184, 134, 11, 0.4);
}

.auth-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.auth-button:disabled {
  background: #bdc3c7;
  box-shadow: none;
  transform: none;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.button-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.auth-button:hover:not(:disabled) .button-icon {
  transform: translateX(3px);
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.8s ease;
}

.auth-button:hover:not(:disabled) .button-shine {
  left: 100%;
}

.auth-footer {
  margin-top: 2rem;
}

.auth-switch {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.switch-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.switch-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #d4af37;
  transition: width 0.3s ease;
}

.switch-link:hover {
  color: #b8860b;
}

.switch-link:hover::after {
  width: 100%;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-section {
  animation: fadeIn 0.6s ease-out;
}

/* Адаптивность */
@media (max-width: 480px) {
  .auth-section {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .forgot-password {
    align-self: flex-end;
  }
}
</style>