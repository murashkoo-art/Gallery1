<template>
  <nav :class="['navigation', `navigation--${type}`]">
    <router-link
      v-for="link in listLinks"
      :key="link.path"
      :to="link.path"
      class="nav-link"
      :class="{ 'active': $route.path === link.path }"
    >
      {{ link.title }}
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  type: {
    type: String,
    default: 'header'
  },
  listLinks: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>

.navigation {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  position: relative;
}

/* Стили для хедера */
.navigation--header .nav-link {
  color: #333;
}

.navigation--header .nav-link:hover {
  color: #d4af37;
  transform: translateY(-1px);
  background: rgba(212, 175, 55, 0.1);
}

.navigation--header .nav-link.active {
  color: #d4af37;
  font-weight: bold;
}

.navigation--header .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: #d4af37;
  animation: underlineSlide 0.3s ease;
}

@keyframes underlineSlide {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Стили для футера */
.navigation--footer {
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.navigation--footer .nav-link {
  color: #ccc;
  padding: 0.25rem 0;
  background: none;
  border-radius: 0;
  font-weight: normal;
  transform: none;
  box-shadow: none;
  width: 100%;
  text-align: left;
}

.navigation--footer .nav-link:hover {
  color: #d4af37;
  transform: none;
  box-shadow: none;
  background: none;
}

.navigation--footer .nav-link.active {
  color: #d4af37;
  font-weight: bold;
}

/* Общие стили для кнопки login */
.nav-link.login {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  border: none;
}

.nav-link.login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

/* Адаптивность */
@media (max-width: 768px) {
  .navigation--header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation--footer {
    align-items: center;
  }
  
  .navigation--footer .nav-link {
    text-align: center;
  }
}
</style>