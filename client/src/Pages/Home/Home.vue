<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-background">
        <div class="background-overlay"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <h2 class="hero-subtitle">ИНФОРМАЦИОННО-СПРАВОЧНАЯ СИСТЕМА</h2>
          <h1 class="hero-title">"GOLDEN RATIO"</h1>
          <p class="hero-description">
            Цифровая экосистема для управления коллекцией и искусством, 
            построенная на принципах гармонии и совершенства
          </p>
          
          <div class="hero-buttons">
            <GoldenButton 
              text="ВОЙТИ" 
              variant="primary"
              @click="goToLogin"
            />
            <GoldenButton 
              text="Зарегистрироваться" 
              variant="secondary"
              @click="goToRegister"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import GoldenButton from '@/components/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  moduleData: {
    type: Object,
    required: true
  }
})

const goToLogin = () => {
  // Переходим на профиль с параметром для формы входа
  router.push('/profile')
}

const goToRegister = () => {
  // Переходим на профиль с параметром для формы регистрации
  router.push('/profile?form=register')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  color: #333;
}


/* Герой-секция */
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  /* Можно добавить background-image или video */
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 2rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  letter-spacing: 3px;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #d4af37, #ffd700);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  line-height: 1.1;
}

.hero-description {
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}



/* Адаптивность */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }
  
  .navigation {
    gap: 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>