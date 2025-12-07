<template>
  <div class="page-wrapper">
    <MainHeader />
    
    <main class="main-content">
      <router-view />
    </main>

    <MainFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainFooter from '@/components/Footer.vue'
import MainHeader from '@/components/Header.vue'

const route = useRoute()
const currentModule = ref(null)

onMounted(() => {
  // Если нужно загружать данные модуля при монтировании
  loadModuleData()
})

const loadModuleData = async () => {
  // логика загрузки данных
}
</script>

<style scoped>
/* Стили остаются без изменений */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: 80px; /* Высота хедера */
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  font-weight: 500;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin: 1rem;
}
</style>