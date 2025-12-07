<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <div class="logo-icon">Φ</div>
        <span class="logo-text">Golden Ratio</span>
      </div>
      <Navigation 
        :list-links="headerLinks" 
        type="header"
      />
    </div>
  </header>
</template>

<script setup>
import Navigation from './Navigation.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const headerLinks = [
  { path: '/', title: 'Главная' },
  { path: '/gallery', title: 'Галерея' },
  { path: '/profile', title: 'Профиль' }
]
</script>

<style scoped>

.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #d4af37, #b8941f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4af37, #b8941f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>